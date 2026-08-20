# Database Migrations

This folder contains SQL migration files for Supabase database setup.

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended for MVP)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order (001, 002, 003, etc.)

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations to Supabase
supabase db push
```

## Migration Files

1. `001_create_profiles.sql` - Creates profiles table and automatic profile creation
2. `002_create_properties.sql` - Creates properties table
3. `003_create_property_images.sql` - Creates property images table
4. `004_create_property_attributes.sql` - Creates property attributes table (dynamic fields)
5. `005_create_leads.sql` - Creates leads table
6. `006_create_viewings.sql` - Creates viewings table
7. `007_create_storage.sql` - Creates storage bucket and policies for images

## Security

All tables have Row Level Security (RLS) enabled with appropriate policies to ensure:

- Agents can only manage their own properties, images, and attributes
- Agents can only view leads for their own properties
- Public can view active properties (and their images/attributes)
- Public can submit interest (create leads) for active properties
- Storage is secured so users can only upload/manage their own images

## Notes

- Run migrations in order
- All timestamps are in UTC
- UUIDs are automatically generated
- The `profiles` table automatically creates a record when a user signs up
