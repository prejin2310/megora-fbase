# Firebase Deployment Instructions

## Fix for "Missing or insufficient permissions" error

The error you're seeing is because Firestore security rules are not configured to allow public read access to the collections needed by your homepage.

### Step 1: Deploy the Firestore Rules

I've created `firestore.rules` file with the correct permissions. Deploy it using:

```powershell
# Make sure you're in the project directory
cd "d:\Dev Space\megorawebiste\megora-jewels"

# Deploy the firestore rules
firebase deploy --only firestore:rules
```

### Step 2: Verify Rule Deployment

After deployment, you can verify the rules in the Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to Firestore Database > Rules
4. Check that the rules match the content in `firestore.rules`

### Step 3: Test the Fix

After deploying the rules:
1. Refresh your homepage
2. The "Missing or insufficient permissions" error should be resolved
3. Homepage components should load product data successfully

### Collections with Public Read Access:
- `products` - needed for product listings
- `categories` - needed for category navigation  
- `community_reviews` - needed for reviews section

### If you still see errors:

1. Check the browser console for more specific error messages
2. Verify your Firebase project ID in `.env.local`
3. Ensure the Firebase project is active and billing is enabled (if required)
4. Check that the collections exist in your Firestore database

### Additional Debugging:

The updated `db.js` file now includes better error logging. Check the console for:
- "Firebase permission denied" messages with specific collection names
- Any other detailed error information

### Firebase CLI Installation (if needed):

If you don't have Firebase CLI installed:
```powershell
npm install -g firebase-tools
firebase login
firebase use --add  # Select your project
```