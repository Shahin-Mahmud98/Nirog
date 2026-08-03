export default function Footer() {
  return (
    <footer className="bg-teal-deep text-[#CDE6DD] px-6 pt-11 pb-6 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-7 border-b border-white/15">
        <div>
          <h5 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Nirog</h5>
          <p className="text-sm text-[#B7D9CB] max-w-[240px]">
            Your neighborhood pharmacy, online. Genuine medicine and healthcare products delivered across Bangladesh.
          </p>
        </div>
        <div>
          <h5 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Shop</h5>
          <ul className="flex flex-col gap-2 text-sm">
            <li>Medicine</li>
            <li>Beauty & skincare</li>
            <li>Healthcare devices</li>
            <li>Baby & mom</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Support</h5>
          <ul className="flex flex-col gap-2 text-sm">
            <li>Track order</li>
            <li>Upload prescription</li>
            <li>Returns & refunds</li>
            <li>Contact us</li>
          </ul>
        </div>
        <div>
          <h5 className="text-white text-xs font-semibold uppercase tracking-wide mb-3">Get in touch</h5>
          <ul className="flex flex-col gap-2 text-sm">
            <li>16000 (24/7 helpline)</li>
            <li>support@nirog.example</li>
            <li>House 12, Road 3, Dhanmondi, Dhaka</li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-4 text-xs text-[#9EC7B7] flex justify-between flex-wrap gap-2">
        <span>© 2026 Nirog. Demo storefront for illustration only.</span>
        <span>Privacy · Terms · Licenses</span>
      </div>
    </footer>
  );
}
