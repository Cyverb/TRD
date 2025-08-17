# Cloud Storage Setup Guide

## Overview
This system now uses cloud storage to share data across all devices and users in real-time. When Person A logs something, Person B will see it immediately.

## Setup Instructions

### Option 1: JSONBin.io (Recommended - Free)

1. **Create Account:**
   - Go to https://jsonbin.io/
   - Sign up for a free account

2. **Create a New Bin:**
   - Click "Create New Bin"
   - Name it "TRD-Database" or similar
   - Add this initial data:
   ```json
   {
     "incidents": [],
     "reports": [],
     "operations": [],
     "personnel": [],
     "violations": [],
     "interrogations": [],
     "activities": [],
     "dashboardStats": {
       "activePersonnel": 47,
       "openCases": 12,
       "violations": 8,
       "siteStatus": "SECURE"
     },
     "lastUpdated": "2024-01-01T00:00:00.000Z"
   }
   ```

3. **Get Your API Key:**
   - Go to your account settings
   - Copy your "Master Key" (starts with `$2a$10$...`)

4. **Update the Code:**
   - Open `script.js`
   - Find these lines:
   ```javascript
   const CLOUD_STORAGE_URL = 'https://api.jsonbin.io/v3/b/your-bin-id';
   const CLOUD_API_KEY = 'your-api-key';
   ```
   - Replace `your-bin-id` with your actual bin ID (from the URL)
   - Replace `your-api-key` with your master key

### Option 2: Firebase (Alternative)

If you prefer Firebase, you can also use Firebase Realtime Database:

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Create a new project
   - Enable Realtime Database

2. **Get Configuration:**
   - Go to Project Settings
   - Copy your Firebase config

3. **Update Code:**
   - Replace the cloud storage functions with Firebase equivalents

## Features

### Real-Time Sync
- Data automatically syncs every 30 seconds
- All users see updates immediately
- Works across different devices and networks

### Backup System
- If cloud is unavailable, falls back to local storage
- No data loss if internet is down
- Syncs when connection is restored

### Security
- Only authorized users can edit data
- View permissions are global
- Edit permissions based on clearance level

## Troubleshooting

### If data isn't syncing:
1. Check your internet connection
2. Verify your API key is correct
3. Check browser console for errors
4. Ensure your JSONBin account is active

### If you see "Cloud load failed":
- The system will use local storage as backup
- Data will sync when connection is restored
- No data will be lost

## Usage

Once configured:
1. Person A logs in and adds an incident
2. Person B logs in from a different device
3. Person B will see the incident immediately
4. All changes sync automatically across all devices

The system maintains all existing permissions - L1-L3 can only edit incidents/interrogations/violations, while L4-L5 and Master have full access. 