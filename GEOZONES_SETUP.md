# Milujemedrony Geozones Management System

A Next.js application for managing drone restricted zone files (geojson) for Slovakia.

## Setup Instructions

### 1. MongoDB Connection

Update the `DATABASE_URL` in your `.env` file with your MongoDB Atlas connection string:

```
DATABASE_URL="mongodb+srv://username:password@your-cluster.mongodb.net/milujemedrony"
```

Replace:
- `username` - Your MongoDB user
- `password` - Your MongoDB password
- `your-cluster` - Your MongoDB cluster name

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Home Page
Navigate to `http://localhost:3000` to see the landing page with a link to the admin dashboard.

### Admin Dashboard
Visit `http://localhost:3000/admin/geozones` to manage geozones.

#### Upload a Geozone
1. Enter a geozone name (e.g., `Bratislava_NoFly_Zone`)
2. Optionally add a description
3. Select a `.geojson` file from your computer
4. Click "Upload Geozone"

The file will be uploaded with automatic version numbering:
- First upload: version 1
- Subsequent uploads with the same name: version 2, 3, etc.

#### View Geozones
All uploaded geozones are displayed in a table showing:
- Name
- Version
- File size
- Upload date
- Description (if provided)

#### Download a Geozone
Click the download button next to any geozone to download the file.

#### Delete a Geozone
Click the delete button and confirm to remove a specific version of a geozone.

## API Endpoints

### Upload Geozone
```
POST /api/geozones/upload
Content-Type: multipart/form-data

Parameters:
- file: GeoJSON file (.geojson)
- name: Geozone name
- description: (optional) Description
```

### List All Geozones
```
GET /api/geozones
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Bratislava_NoFly_Zone",
      "version": 1,
      "fileSize": 1234,
      "description": "...",
      "uploadedAt": "2024-01-08T..."
    }
  ]
}
```

### Download Geozone
```
GET /api/geozones/download/{name}/{version}
```

Returns the GeoJSON file as a downloadable attachment.

### Delete Geozone
```
DELETE /api/geozones/{name}/{version}/delete
```

## File Storage

GeoJSON files are stored on the server at:
```
/public/geozones/{name}/{name}-v{version}.geojson
```

Example:
```
/public/geozones/Bratislava_NoFly_Zone/Bratislava_NoFly_Zone-v1.geojson
```

## Database Schema

### Geozone Model

```typescript
model Geozone {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  version     Int
  filePath    String
  fileSize    Int
  description String?
  uploadedAt  DateTime @default(now())

  @@unique([name, version])
  @@index([name])
}
```

## Building for Production

```bash
npm run build
npm run start
```

## Requirements

- Node.js 18+
- MongoDB Atlas account (or local MongoDB instance)
- At least 10MB disk space for storing geozone files

## Validation

- Only `.geojson` files are accepted
- Files must contain valid GeoJSON format:
  - FeatureCollection with Features
  - Feature with Geometry
  - Valid Geometry objects (Point, LineString, Polygon, etc.)
- File size limit is controlled by Node.js and server configuration

## Notes

- Automatic versioning ensures old versions are preserved when uploading updated geozones
- Files are stored in the public directory for efficient serving
- Database only stores metadata; actual GeoJSON content is on the filesystem
- No authentication required for current version (add as needed)
