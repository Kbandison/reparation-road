export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No header/footer for password reset page - completely isolated
  return <>{children}</>;
}
