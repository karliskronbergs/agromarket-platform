import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Agromarket",
};

const CONTACT_EMAIL = "privacy@agromarket.lv";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === "lv") {
    return (
      <LegalPage title="Privātuma politika" updated="Pēdējie labojumi: 2026. gada septembris">
        <LegalSection title="1. Kas mēs esam">
          <p>
            Šo tīmekļa vietni (agromarket.lv, turpmāk — &quot;Agromarket&quot; vai &quot;mēs&quot;)
            uztur [UZŅĒMUMA / PĀRVALDĪTĀJA NOSAUKUMS]. Jautājumu vai pieprasījumu gadījumā par šo
            privātuma politiku vai savu datu apstrādi, raksti mums uz{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#3f6b3f] underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="2. Kādus datus mēs apkopojam">
          <p>Atkarībā no tā, kā izmanto Agromarket, mēs apstrādājam:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Konta datus</strong> — e-pasta adresi un paroli (paroles tiek glabātas
              šifrētā veidā, izmantojot mūsu autentifikācijas pakalpojumu Supabase).
            </li>
            <li>
              <strong>Uzņēmuma profila datus</strong> — uzņēmuma nosaukumu, aprakstu, tālruni,
              kontakta e-pastu, tīmekļa vietni, adresi (adrese tiek pārveidota par kartes
              koordinātām, izmantojot OpenStreetMap Nominatim ģeokodēšanas pakalpojumu), logo un
              vāka attēlu.
            </li>
            <li>
              <strong>Sludinājumu saturu</strong> — nosaukumu, aprakstu, cenu, kategorijai
              specifiskus laukus (piemēram, šķirni, vecumu, ražotāju) un fotogrāfijas, ko pievieno
              sludinājumam.
            </li>
            <li>
              <strong>Ziņapmaiņu</strong> — ziņas, ko sūti citiem lietotājiem, izmantojot vietnes
              iebūvēto ziņojumapmaiņas funkciju.
            </li>
            <li>
              <strong>Lietošanas datus</strong> — profilu un sludinājumu skatījumu skaitu. Lai
              novērstu vienas un tās pašas personas atkārtotu skaitīšanu, mēs uz laiku apstrādājam
              tavu IP adresi un pārlūkprogrammas informāciju vienvirziena jaucējfunkcijas
              (hash) veidā — pašu IP adresi mēs neglabājam.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Sīkdatnes">
          <p>
            Mēs izmantojam tikai tehniski nepieciešamās sīkdatnes, lai uzturētu tavu pieteikšanos
            vietnē (autentifikācijas sesiju, ko nodrošina Supabase). Vietnes vispārējās
            apmeklētības izpratnei izmantojam Vercel Web Analytics — pakalpojumu, kas nelieto
            sīkdatnes un neapkopo personu identificējošu informāciju. Mēs neizmantojam
            reklāmu vai izsekošanas sīkdatnes.
          </p>
        </LegalSection>

        <LegalSection title="4. Kāpēc mēs apstrādājam šos datus">
          <p>
            Datus apstrādājam, lai izpildītu ar tevi noslēgto lietošanas līgumu (konta un profila
            uzturēšana, sludinājumu publicēšana, ziņu piegāde), pamatojoties uz mūsu leģitīmajām
            interesēm (pamata lietošanas statistika, krāpšanas un ļaunprātīgas izmantošanas
            novēršana) un, atsevišķos gadījumos, pamatojoties uz tavu piekrišanu (piemēram,
            izvēles profila laukumi).
          </p>
        </LegalSection>

        <LegalSection title="5. Ar ko mēs dalāmies datiem">
          <p>Tavus datus apstrādā šādi pakalpojumu sniedzēji, kas darbojas kā mūsu datu apstrādātāji:</p>
          <ul className="list-disc pl-5">
            <li>
              <strong>Supabase</strong> — datubāze, autentifikācija un failu glabātuve.
            </li>
            <li>
              <strong>Vercel</strong> — vietnes hostings un pamata apmeklētības statistika.
            </li>
            <li>
              <strong>OpenStreetMap Nominatim</strong> — adrešu pārveidošana par kartes
              koordinātām.
            </li>
          </ul>
          <p>
            Tavu publisko profilu un sludinājumus var redzēt citi vietnes apmeklētāji un
            lietotāji — tas ir platformas mērķis. Citi reģistrētie lietotāji var tev sūtīt ziņas
            caur vietnes ziņojumapmaiņas sistēmu. Mēs nepārdodam tavus datus trešajām pusēm
            reklāmas nolūkos.
          </p>
        </LegalSection>

        <LegalSection title="6. Cik ilgi mēs glabājam datus">
          <p>
            Konta un profila dati tiek glabāti, kamēr tavs konts ir aktīvs. Sludinājumi automātiski
            zaudē aktivitāti pēc noteikta laika, ja tos neatjauno. Vari jebkurā brīdī neatgriezeniski
            dzēst savu profilu un visus tā sludinājumus sava konta iestatījumos.
          </p>
        </LegalSection>

        <LegalSection title="7. Tavas tiesības">
          <p>
            Saskaņā ar Vispārīgo datu aizsardzības regulu (VDAR) tev ir tiesības piekļūt saviem
            datiem, tos labot, dzēst, ierobežot to apstrādi, iebilst pret apstrādi un saņemt datus
            strukturētā formātā. Lai to izdarītu, vari izmantot sava konta iestatījumus vai
            sazināties ar mums uz{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#3f6b3f] underline">
              {CONTACT_EMAIL}
            </a>
            . Ja uzskati, ka tavu datu apstrāde pārkāpj VDAR, tev ir tiesības iesniegt sūdzību
            Datu valsts inspekcijā (dvi.gov.lv).
          </p>
        </LegalSection>

        <LegalSection title="8. Izmaiņas šajā politikā">
          <p>
            Ja veiksim būtiskas izmaiņas šajā privātuma politikā, mēs par tām paziņosim, publicējot
            atjauninātu versiju šajā lapā.
          </p>
        </LegalSection>
      </LegalPage>
    );
  }

  return (
    <LegalPage title="Privacy Policy" updated="Last updated: September 2026">
      <LegalSection title="1. Who we are">
        <p>
          This website (agromarket.lv, &quot;Agromarket&quot;, &quot;we&quot;) is operated by
          [COMPANY / OPERATOR NAME]. For any question or request about this policy or your data,
          contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#3f6b3f] underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. What data we collect">
        <p>Depending on how you use Agromarket, we process:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Account data</strong> — your email address and password (passwords are stored
            encrypted by our authentication provider, Supabase).
          </li>
          <li>
            <strong>Business profile data</strong> — business name, description, phone number,
            contact email, website, and address (converted to map coordinates using the
            OpenStreetMap Nominatim geocoding service), plus any logo/cover images you upload.
          </li>
          <li>
            <strong>Listing content</strong> — title, description, price, category-specific
            fields (e.g. breed, age, manufacturer), and photos you attach to a listing.
          </li>
          <li>
            <strong>Messages</strong> — messages you send to other users through the platform&apos;s
            built-in messaging feature.
          </li>
          <li>
            <strong>Usage data</strong> — profile and listing view counts. To avoid counting the
            same visitor twice, we briefly process your IP address and browser information as a
            one-way hash — we do not store the raw IP address.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cookies">
        <p>
          We use only strictly necessary cookies to keep you signed in (an authentication session
          cookie provided by Supabase). To understand overall site traffic we use Vercel Web
          Analytics, a cookieless service that does not collect personally identifying
          information. We do not use advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="4. Why we process this data">
        <p>
          We process your data to perform our contract with you (running your account, profile
          and listings, delivering messages), based on our legitimate interests (basic usage
          statistics, fraud and abuse prevention), and, where applicable, based on your consent
          (e.g. optional profile fields).
        </p>
      </LegalSection>

      <LegalSection title="5. Who we share data with">
        <p>Your data is processed by the following service providers, acting as our data processors:</p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Supabase</strong> — database, authentication and file storage.
          </li>
          <li>
            <strong>Vercel</strong> — website hosting and basic traffic analytics.
          </li>
          <li>
            <strong>OpenStreetMap Nominatim</strong> — converting addresses to map coordinates.
          </li>
        </ul>
        <p>
          Your public profile and listings can be seen by other visitors and users — that is the
          purpose of the platform. Other registered users can send you messages through the site&apos;s
          messaging system. We do not sell your data to third parties for advertising purposes.
        </p>
      </LegalSection>

      <LegalSection title="6. How long we keep data">
        <p>
          Account and profile data is kept while your account is active. Listings automatically
          expire after a set period if not renewed. You can permanently delete your profile and
          all its listings at any time from your account settings.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <p>
          Under the General Data Protection Regulation (GDPR) you have the right to access,
          correct, delete, restrict, or object to the processing of your data, and to receive it
          in a portable format. You can exercise most of these through your account settings, or
          by contacting us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#3f6b3f] underline">
            {CONTACT_EMAIL}
          </a>
          . If you believe our processing violates the GDPR, you have the right to lodge a
          complaint with Latvia&apos;s Data State Inspectorate (dvi.gov.lv).
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to this policy">
        <p>
          If we make material changes to this privacy policy, we will announce them by publishing
          an updated version on this page.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
