"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
    AdditiveBlending,
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    Group,
    Line,
    LineDashedMaterial,
    OrthographicCamera,
    Points,
    ShaderMaterial,
    Vector3,
} from "three";
import { FALLBACK_ACCENT, parseCssColor } from "./accent";
import { SKY_H, SKY_W, skyLayout } from "./layout";

/**
 * V3-05 constellation sky (lazily imported by SkyCanvasIsland — the ONLY module that imports
 * three / R3F). A slowly orbiting far field, the poster's own stars twinkling in place, and the
 * flagship projects as brighter accent stars joined by faint dashed lines. Pointer parallax by
 * depth. `frameloop="demand"`: frames come only from the 30 fps loop below, which runs while the
 * canvas is on screen and the tab is visible.
 */

const FPS_INTERVAL = 1000 / 30;
const ORBIT_RAD_PER_S = (Math.PI * 2) / 900; // one turn per 15 min
const FAR_STARS = 650;
const FAR_RADIUS = Math.hypot(SKY_W / 2, SKY_H / 2) * 1.15; // covers the corners while rotating
const PARALLAX = { far: 0.5, near: 1.1, bright: 1.7 } as const;
const STAR_WHITE = new Vector3(0.93, 0.94, 1);

const VERTEX = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute float aPhase;
uniform float uPx;
uniform float uTime;
uniform float uTwinkle;
varying float vAlpha;
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * uPx * 6.0, 2.0);
    float speed = 0.5 + fract(aPhase * 7.13) * 1.3;
    float tw = 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(uTime * speed + aPhase));
    vAlpha = aAlpha * tw;
}`;

const FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.18, 0.34, d);
    float halo = pow(max(1.0 - d, 0.0), 3.0) * 0.35;
    float a = (core + halo) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
}`;

interface StarSpec {
    x: number;
    y: number;
    size: number;
    alpha: number;
    phase: number;
}

/** sRGB components straight into the shader (ShaderMaterial skips colour management). */
function srgbVector(hex: string) {
    const n = Number.parseInt(hex.slice(1), 16);
    return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function starPoints(specs: StarSpec[], color: Vector3, twinkle: number) {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
        "position",
        new Float32BufferAttribute(
            specs.flatMap((s) => [s.x, s.y, 0]),
            3,
        ),
    );
    geometry.setAttribute(
        "aSize",
        new Float32BufferAttribute(
            specs.map((s) => s.size),
            1,
        ),
    );
    geometry.setAttribute(
        "aAlpha",
        new Float32BufferAttribute(
            specs.map((s) => s.alpha),
            1,
        ),
    );
    geometry.setAttribute(
        "aPhase",
        new Float32BufferAttribute(
            specs.map((s) => s.phase),
            1,
        ),
    );
    const material = new ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        uniforms: {
            uColor: { value: color },
            uPx: { value: 10 },
            uTime: { value: 0 },
            uTwinkle: { value: twinkle },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
    });
    return new Points(geometry, material);
}

/** Poster coordinates (y down, 0..100 × 0..60) -> world (y up, centred). */
function toWorld(x: number, y: number) {
    return { x: x - SKY_W / 2, y: SKY_H / 2 - y };
}

function readAccent(host: HTMLElement | null): string {
    if (!host) return FALLBACK_ACCENT;
    const probe = document.createElement("span");
    probe.style.color = "var(--accent)";
    probe.style.display = "none";
    host.appendChild(probe);
    const parsed = parseCssColor(getComputedStyle(probe).color);
    probe.remove();
    return parsed ?? FALLBACK_ACCENT;
}

interface SkyGraph {
    root: Group;
    far: Group;
    near: Group;
    bright: Group;
    materials: ShaderMaterial[];
    dispose: () => void;
}

function buildSky(flags: number, accentHex: string): SkyGraph {
    const { stars, bright } = skyLayout(flags);
    let seed = 0x5eed;
    const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 2 ** 32;
    };

    const farSpecs: StarSpec[] = Array.from({ length: FAR_STARS }, () => {
        const r = Math.sqrt(rnd()) * FAR_RADIUS;
        const a = rnd() * Math.PI * 2;
        return {
            x: Math.cos(a) * r,
            y: Math.sin(a) * r,
            size: 0.03 + rnd() * rnd() * 0.1,
            alpha: 0.18 + rnd() * 0.4,
            phase: rnd() * Math.PI * 2,
        };
    });
    const nearSpecs: StarSpec[] = stars.map((s) => ({
        ...toWorld(s.x, s.y),
        size: s.r,
        alpha: s.o,
        phase: rnd() * Math.PI * 2,
    }));
    const brightWorld = bright.map((p) => toWorld(p.x, p.y));
    const flagSpecs = brightWorld
        .slice(0, flags)
        .map((p) => ({ ...p, size: 0.55, alpha: 1, phase: rnd() * Math.PI * 2 }));
    const otherSpecs = brightWorld
        .slice(flags)
        .map((p) => ({ ...p, size: 0.35, alpha: 0.95, phase: rnd() * Math.PI * 2 }));

    const accent = srgbVector(accentHex);
    const farPoints = starPoints(farSpecs, STAR_WHITE, 0.35);
    const nearPoints = starPoints(nearSpecs, STAR_WHITE, 0.45);
    const flagPoints = starPoints(flagSpecs, accent, 0.15);
    const otherPoints = starPoints(otherSpecs, STAR_WHITE, 0.2);

    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute(
        "position",
        new Float32BufferAttribute(
            brightWorld.flatMap((p) => [p.x, p.y, 0]),
            3,
        ),
    );
    const lineMaterial = new LineDashedMaterial({
        color: new Color(accentHex),
        dashSize: 0.6,
        gapSize: 0.6,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
    });
    const line = new Line(lineGeometry, lineMaterial);
    line.computeLineDistances();

    const far = new Group();
    far.add(farPoints);
    const near = new Group();
    near.add(nearPoints);
    const brightGroup = new Group();
    brightGroup.add(line, otherPoints, flagPoints);
    const root = new Group();
    root.add(far, near, brightGroup);

    const pointsList = [farPoints, nearPoints, flagPoints, otherPoints];
    const materials = pointsList.map((p) => p.material);
    return {
        root,
        far,
        near,
        bright: brightGroup,
        materials,
        dispose: () => {
            for (const p of pointsList) {
                p.geometry.dispose();
                p.material.dispose();
            }
            lineGeometry.dispose();
            lineMaterial.dispose();
        },
    };
}

interface SkyProps {
    flags: number;
    onFirstFrame: () => void;
}

function Sky({ flags, onFirstFrame }: SkyProps) {
    const get = useThree((s) => s.get);
    const width = useThree((s) => s.size.width);
    const height = useThree((s) => s.size.height);
    const graphRef = useRef<SkyGraph | null>(null);
    const firstFrameRef = useRef(onFirstFrame);

    useEffect(() => {
        firstFrameRef.current = onFirstFrame;
    }, [onFirstFrame]);

    // Build once per flag count; dispose every geometry/material on unmount.
    useEffect(() => {
        const { scene, gl, invalidate } = get();
        const graph = buildSky(flags, readAccent(gl.domElement.parentElement));
        scene.add(graph.root);
        graphRef.current = graph;
        invalidate();
        return () => {
            scene.remove(graph.root);
            graph.dispose();
            graphRef.current = null;
        };
    }, [get, flags]);

    // "Slice" fit, same as the SVG poster's preserveAspectRatio, so the cross-fade lines up.
    useEffect(() => {
        const { camera, invalidate } = get();
        if (!(camera instanceof OrthographicCamera) || width === 0 || height === 0) return;
        camera.zoom = Math.max(width / SKY_W, height / SKY_H);
        camera.updateProjectionMatrix();
        invalidate();
    }, [get, width, height]);

    // The only frame source: ~30 fps rAF, alive only while intersecting AND the tab is visible.
    useEffect(() => {
        const { gl, invalidate } = get();
        const canvas = gl.domElement;
        const section = canvas.closest("section");
        const pointer = { x: 0, y: 0 };
        const eased = { x: 0, y: 0 };
        let intersecting = false;
        let raf = 0;
        let last = 0;
        let time = 0;
        let rendered = false;
        let announced = false;

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            if (last !== 0 && now - last < FPS_INTERVAL) return;
            const dt = last === 0 ? 0 : Math.min((now - last) / 1000, 0.1);
            last = now;
            if (rendered && !announced) {
                announced = true;
                firstFrameRef.current();
            }
            const graph = graphRef.current;
            if (!graph) return;
            const state = get();
            const px = state.camera.zoom * state.viewport.dpr;
            time += dt;
            eased.x += (pointer.x - eased.x) * 0.08;
            eased.y += (pointer.y - eased.y) * 0.08;
            graph.far.rotation.z = time * ORBIT_RAD_PER_S;
            graph.far.position.set(eased.x * PARALLAX.far, eased.y * PARALLAX.far, 0);
            graph.near.position.set(eased.x * PARALLAX.near, eased.y * PARALLAX.near, 0);
            graph.bright.position.set(eased.x * PARALLAX.bright, eased.y * PARALLAX.bright, 0);
            for (const m of graph.materials) {
                const uTime = m.uniforms.uTime;
                if (uTime) uTime.value = time;
                const uPx = m.uniforms.uPx;
                if (uPx) uPx.value = px;
            }
            invalidate();
            rendered = true;
        };

        const sync = () => {
            const run = intersecting && document.visibilityState === "visible";
            if (run && raf === 0) {
                last = 0;
                raf = requestAnimationFrame(tick);
            } else if (!run && raf !== 0) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        };

        const io = new IntersectionObserver((entries) => {
            intersecting = entries.some((e) => e.isIntersecting);
            sync();
        });
        io.observe(canvas);
        document.addEventListener("visibilitychange", sync);

        const onPointer = (e: PointerEvent) => {
            if (!section) return;
            const rect = section.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        };
        const onLeave = () => {
            pointer.x = 0;
            pointer.y = 0;
        };
        section?.addEventListener("pointermove", onPointer, { passive: true });
        section?.addEventListener("pointerleave", onLeave);

        return () => {
            io.disconnect();
            document.removeEventListener("visibilitychange", sync);
            section?.removeEventListener("pointermove", onPointer);
            section?.removeEventListener("pointerleave", onLeave);
            if (raf !== 0) cancelAnimationFrame(raf);
        };
    }, [get]);

    return null;
}

export default function SkyScene({ flags, onFirstFrame }: SkyProps) {
    return (
        <Canvas
            orthographic
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 50], near: 0.1, far: 200, zoom: 10 }}
            gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
        >
            <Sky flags={flags} onFirstFrame={onFirstFrame} />
        </Canvas>
    );
}
