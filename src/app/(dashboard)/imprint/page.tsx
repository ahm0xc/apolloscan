export default function ImprintPage() {
  return (
    <div className="container mx-auto py-8 px-4 pt-40">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Imprint</h1>

        <div className="space-y-4">
          <p className="font-medium">VIAGGISSIMO LTD</p>
          <p>B1, THE ATRIUM, WEST STREET MSIDA, Msd1840 Malta</p>
          <p>Company Registration No.: C 96768</p>
          <p>
            Clients Contact:{" "}
            <a
              href="mailto:info.helpsonic@gmail.com"
              className="text-blue-600 hover:underline"
            >
              info.helpsonic@gmail.com
            </a>
          </p>
          <p>Design, Privacy Policy & hosted by NBC Ukraine LLC</p>
          <p>
            St. Pershotravneva 75, urban settlement Voronovitsa, Vinnytsya
            district, Ukraine 23252
          </p>
        </div>
      </div>
    </div>
  );
}
