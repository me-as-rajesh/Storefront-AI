# **App Name**: Storefront AI

## Core Features:

- Login: Simple login form with email and password to authenticate users.
- Signup: User registration form to collect email and password and create user accounts.
- Profile: User profile to display email and provide an option to logout.
- Dashboard: Show a list of all websites created by the user (private and public). Use Firebase Firestore or Realtime Database to store metadata and Firebase Storage to store actual HTML files. Display each created site in a card view with the preview link, title, and delete option
- Website Content Form: Input form to generate website content including store name, tagline, about, product list, contact info, social links, and store hours.
- Dynamic HTML Generation: AI-powered tool generates tailored HTML content and CSS styling based on the input from the 'Website Content Form'.
- Website Preview and Sharing: Preview generated HTML page and provides options to download or share.
- Edit Page: Allow users to update each section (e.g., About, Products, Contact) using editable boxes. After editing, update the corresponding HTML file in Firebase Storage.
- Website Download: Download generated website as a single .html file.
- Firebase Integration: Use Firebase Authentication for login/signup. Use Firebase Storage to upload and fetch the HTML files. Store metadata (title, user, visibility) in Firestore. Show public websites in the home page of other users if visibility is set to public.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) to evoke trust and innovation.
- Background color: Light gray (#F0F2F5) for a clean, modern feel.
- Accent color: A complementary orange (#FF9933) for call-to-action buttons and important highlights.
- Body text and headlines: Use 'Inter' sans-serif font, offering a modern, neutral look for both.
- Use simple, outline-style icons to represent actions and information. Consistent style across all pages.
- Implement a clean, card-based layout for the home page to display websites. Use consistent spacing and alignment throughout the app.
- Use subtle, non-intrusive loading animations and transitions to provide a smooth user experience.