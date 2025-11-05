# Firebase Setup

This project uses Firebase Firestore to store contact form submissions with Anonymous Authentication for security.

## Environment Variables

The following environment variables are required and should be set in `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

See `.env.example` for the template.

## Firebase Project

- **Project ID**: dragoscatalin-ro
- **Project Location**: europe-west

## Authentication

The contact form uses **Anonymous Authentication** to ensure submissions only come from your website domains.

### Enable Anonymous Authentication

1. Go to the [Firebase Console - Authentication](https://console.firebase.google.com/project/dragoscatalin-ro/authentication/providers)
2. Click on "Get Started" if not already enabled
3. Select "Anonymous" from the sign-in providers list
4. Toggle "Enable" and click "Save"

### Authorized Domains

Configure authorized domains in the [Firebase Console - Authentication Settings](https://console.firebase.google.com/project/dragoscatalin-ro/authentication/settings):

1. Click on "Settings" tab
2. Under "Authorized domains", add your production domain(s)
3. `localhost` is automatically included for development

Recommended domains to add:
- Your production domain (e.g., `dragoscatalin.ro`, `www.dragoscatalin.ro`)
- Any staging/preview domains (e.g., `*.vercel.app` if using Vercel)

## Firestore Collections

### contact_submissions

Stores contact form submissions with the following fields:

- `name` (string): Sender's name
- `email` (string): Sender's email address
- `message` (string): Message content
- `createdAt` (timestamp): Submission timestamp (server-side)
- `status` (string): Submission status (default: "new")

## Security Rules

The Firestore security rules require anonymous authentication before allowing submissions. This prevents spam and ensures submissions only come from authorized domains:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow only authenticated users (including anonymous) to create contact submissions
    match /contact_submissions/{document} {
      allow create: if request.auth != null 
                    && request.auth.token.firebase.sign_in_provider == 'anonymous';
      allow read, update, delete: if false;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Security Benefits

1. **Domain Restriction**: Anonymous auth only works from authorized domains configured in Firebase
2. **Spam Prevention**: Prevents direct API access and bot submissions
3. **No User Management**: Users are automatically authenticated without sign-up
4. **Rate Limiting**: Firebase automatically rate limits anonymous authentication
5. **Data Privacy**: Reading, updating, and deleting submissions is completely blocked

## Deployment

To deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

## Viewing Submissions

Contact form submissions can be viewed in the [Firebase Console](https://console.firebase.google.com/project/dragoscatalin-ro/firestore/databases/-default-/data/~2Fcontact_submissions).

## How It Works

1. User visits your website on an authorized domain
2. When submitting the contact form, the app automatically signs in anonymously
3. Firebase checks the domain is authorized
4. Firestore rules verify the user is authenticated anonymously
5. Submission is stored in Firestore
6. User's anonymous session is maintained during the page visit
