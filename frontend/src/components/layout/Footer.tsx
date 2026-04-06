export default function Footer() {
  return (
    <footer className="bg-muted py-8 border-t mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TechZone - Đồ án TMĐT HUMG. All rights reserved.
      </div>
    </footer>
  );
}