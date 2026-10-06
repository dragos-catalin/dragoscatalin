import type { ReactNode } from "react";
import {
    AIIcon,
    AWSIcon,
    AzureIcon,
    DockerIcon,
    DrizzleIcon,
    FirebaseIcon,
    GCPIcon,
    GitIcon,
    GraphQLIcon,
    KubernetesIcon,
    LinuxIcon,
    MongoDBIcon,
    NextIcon,
    NginxIcon,
    NodeIcon,
    PostgreSQLIcon,
    PrismaIcon,
    PythonIcon,
    ReactIcon,
    RedisIcon,
    StripeIcon,
    TailwindIcon,
    TensorFlowIcon,
    TerraformIcon,
    TypeScriptIcon,
    VercelIcon,
} from "@/components/icons";

const ICON = "size-4";

export const TECH_STACK: ReadonlyArray<{ name: string; icon: ReactNode }> = [
    { name: "React", icon: <ReactIcon className={ICON} /> },
    { name: "Next.js", icon: <NextIcon className={ICON} /> },
    { name: "TypeScript", icon: <TypeScriptIcon className={ICON} /> },
    { name: "Tailwind", icon: <TailwindIcon className={ICON} /> },
    { name: "Node.js", icon: <NodeIcon className={ICON} /> },
    { name: "Python", icon: <PythonIcon className={ICON} /> },
    { name: "PostgreSQL", icon: <PostgreSQLIcon className={ICON} /> },
    { name: "MongoDB", icon: <MongoDBIcon className={ICON} /> },
    { name: "Redis", icon: <RedisIcon className={ICON} /> },
    { name: "Prisma", icon: <PrismaIcon className={ICON} /> },
    { name: "Drizzle", icon: <DrizzleIcon className={ICON} /> },
    { name: "GraphQL", icon: <GraphQLIcon className={ICON} /> },
    { name: "Docker", icon: <DockerIcon className={ICON} /> },
    { name: "Kubernetes", icon: <KubernetesIcon className={ICON} /> },
    { name: "AWS", icon: <AWSIcon className={ICON} /> },
    { name: "Azure", icon: <AzureIcon className={ICON} /> },
    { name: "Google Cloud", icon: <GCPIcon className={ICON} /> },
    { name: "Firebase", icon: <FirebaseIcon className={ICON} /> },
    { name: "Vercel", icon: <VercelIcon className={ICON} /> },
    { name: "Terraform", icon: <TerraformIcon className={ICON} /> },
    { name: "Nginx", icon: <NginxIcon className={ICON} /> },
    { name: "Linux", icon: <LinuxIcon className={ICON} /> },
    { name: "Git", icon: <GitIcon className={ICON} /> },
    { name: "Stripe", icon: <StripeIcon className={ICON} /> },
    { name: "TensorFlow", icon: <TensorFlowIcon className={ICON} /> },
    { name: "AI/ML", icon: <AIIcon className={ICON} /> },
];

/** Pill list of technologies — static markup, entrance handled by the parent's CSS stagger. */
export function TechStack({ label }: { label: string }) {
    return (
        <div className="grid w-full gap-4 md:grid-cols-[12rem_minmax(0,1fr)] md:items-start md:gap-8">
            <p className="pt-1.5 font-mono text-xs tracking-[0.18em] text-fg-subtle uppercase">
                {label}
            </p>
            <ul className="flex flex-wrap gap-2">
                {TECH_STACK.map((tech, i) => (
                    <li
                        key={tech.name}
                        style={{ "--i": i } as React.CSSProperties}
                        className="hero-pill flex cursor-default items-center gap-1.5 rounded-pill border border-line bg-surface/80 px-3 py-1.5 text-xs font-medium text-fg shadow-elev-1 transition-[color,border-color,background-color,box-shadow,transform] duration-200 hover:border-accent/30 hover:bg-accent-soft hover:text-fg hover:shadow-elev-2 motion-safe:hover:-translate-y-0.5"
                    >
                        {tech.icon}
                        {tech.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
