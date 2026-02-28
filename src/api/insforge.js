import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL || 'https://ha3bcz5w.ap-southeast.insforge.app',
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDY1ODF9.PW36RKreajjAXM9gJ9egvhxldLTcs-phb2y26sxTmkw',
});

export default insforge;
