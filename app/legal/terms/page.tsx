"use client"

import { useLocale } from "@/lib/i18n/locale-context"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"

export default function TermsPage() {
    const { locale } = useLocale()

    const content = {
        en: {
            title: "Terms of Service",
            lastUpdated: "Last Updated:",
            lastUpdatedDate: "December 2024",
            sections: [
                {
                    title: "Agreement to Terms",
                    paragraphs: [
                        "By accessing and using Amor Lento's website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.",
                    ],
                },
                {
                    title: "Use License",
                    paragraphs: [
                        "Permission is granted to temporarily access and view the materials on Amor Lento's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:",
                        "• Modify or copy the materials",
                        "• Use the materials for any commercial purpose or for any public display",
                        "• Attempt to reverse engineer any software contained on the website",
                        "• Remove any copyright or other proprietary notations from the materials",
                        "• Transfer the materials to another person or 'mirror' the materials on any other server",
                    ],
                },
                {
                    title: "Intellectual Property",
                    paragraphs: [
                        "All content on this website, including but not limited to poems, love letters, text, graphics, logos, images, and software, is the property of Amor Lento or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.",
                        "You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without prior written consent from Amor Lento.",
                    ],
                },
                {
                    title: "User Accounts",
                    paragraphs: [
                        "If you create an account on our website, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.",
                        "You agree to notify us immediately of any unauthorized use of your account or any other breach of security.",
                    ],
                },
                {
                    title: "Newsletter Subscription",
                    paragraphs: [
                        "By subscribing to our newsletter, you agree to receive weekly poems and updates via email. You can unsubscribe at any time using the unsubscribe link provided in each email or by visiting our unsubscribe page.",
                        "We reserve the right to modify or discontinue the newsletter service at any time without notice.",
                    ],
                },
                {
                    title: "User Content",
                    paragraphs: [
                        "If you submit any content to our website (such as comments, feedback, or other materials), you grant Amor Lento a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media.",
                        "You represent and warrant that you own or have the necessary rights to grant the license described above and that your content does not violate any third-party rights.",
                    ],
                },
                {
                    title: "Prohibited Uses",
                    paragraphs: [
                        "You may not use our website:",
                        "• In any way that violates any applicable law or regulation",
                        "• To transmit, or procure the sending of, any advertising or promotional material without our prior written consent",
                        "• To impersonate or attempt to impersonate Amor Lento, an employee, another user, or any other person or entity",
                        "• In any way that infringes upon the rights of others, or in any way that is illegal, threatening, fraudulent, or harmful",
                        "• To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website",
                    ],
                },
                {
                    title: "Disclaimer",
                    paragraphs: [
                        "The materials on Amor Lento's website are provided on an 'as is' basis. Amor Lento makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.",
                        "Further, Amor Lento does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.",
                    ],
                },
                {
                    title: "Limitation of Liability",
                    paragraphs: [
                        "In no event shall Amor Lento or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Amor Lento's website, even if Amor Lento or an authorized representative has been notified orally or in writing of the possibility of such damage.",
                    ],
                },
                {
                    title: "Revisions and Errata",
                    paragraphs: [
                        "The materials appearing on Amor Lento's website could include technical, typographical, or photographic errors. Amor Lento does not warrant that any of the materials on its website are accurate, complete, or current.",
                        "Amor Lento may make changes to the materials contained on its website at any time without notice. Amor Lento does not, however, make any commitment to update the materials.",
                    ],
                },
                {
                    title: "Links to Other Websites",
                    paragraphs: [
                        "Our website may contain links to third-party websites or services that are not owned or controlled by Amor Lento. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.",
                        "You acknowledge and agree that Amor Lento shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services.",
                    ],
                },
                {
                    title: "Termination",
                    paragraphs: [
                        "We may terminate or suspend your access to our website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.",
                        "Upon termination, your right to use the website will immediately cease.",
                    ],
                },
                {
                    title: "Governing Law",
                    paragraphs: [
                        "These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Amor Lento operates, without regard to its conflict of law provisions.",
                    ],
                },
                {
                    title: "Changes to Terms",
                    paragraphs: [
                        "We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.",
                        "By continuing to access or use our website after any revisions become effective, you agree to be bound by the revised terms.",
                    ],
                },
                {
                    title: "Contact Information",
                    paragraphs: [
                        "If you have any questions about these Terms of Service, please contact us at:",
                        "Email: legal@amorlento.com",
                    ],
                },
            ],
        },
        es: {
            title: "Términos de Servicio",
            lastUpdated: "Última actualización:",
            lastUpdatedDate: "Diciembre 2024",
            sections: [
                {
                    title: "Acuerdo a los Términos",
                    paragraphs: [
                        "Al acceder y usar el sitio web de Amor Lento, usted acepta y se compromete a cumplir con los términos y disposiciones de este acuerdo. Si no está de acuerdo en cumplir con lo anterior, por favor no use este servicio.",
                    ],
                },
                {
                    title: "Licencia de Uso",
                    paragraphs: [
                        "Se otorga permiso para acceder temporalmente y ver los materiales en el sitio web de Amor Lento solo para visualización personal y no comercial temporal. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia no puede:",
                        "• Modificar o copiar los materiales",
                        "• Usar los materiales para cualquier propósito comercial o para cualquier exhibición pública",
                        "• Intentar hacer ingeniería inversa de cualquier software contenido en el sitio web",
                        "• Eliminar cualquier notación de derechos de autor u otra propiedad de los materiales",
                        "• Transferir los materiales a otra persona o 'reflejar' los materiales en cualquier otro servidor",
                    ],
                },
                {
                    title: "Propiedad Intelectual",
                    paragraphs: [
                        "Todo el contenido en este sitio web, incluyendo pero no limitado a poemas, cartas de amor, texto, gráficos, logotipos, imágenes y software, es propiedad de Amor Lento o sus proveedores de contenido y está protegido por leyes de derechos de autor, marcas registradas y otras leyes de propiedad intelectual.",
                        "No puede reproducir, distribuir, modificar, crear obras derivadas, exhibir públicamente, realizar públicamente, republicar, descargar, almacenar o transmitir ninguno de los materiales en nuestro sitio web sin el consentimiento previo por escrito de Amor Lento.",
                    ],
                },
                {
                    title: "Cuentas de Usuario",
                    paragraphs: [
                        "Si crea una cuenta en nuestro sitio web, es responsable de mantener la confidencialidad de su cuenta y contraseña. Usted acepta aceptar la responsabilidad de todas las actividades que ocurran bajo su cuenta.",
                        "Usted acepta notificarnos inmediatamente de cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad.",
                    ],
                },
                {
                    title: "Suscripción al Boletín",
                    paragraphs: [
                        "Al suscribirse a nuestro boletín, acepta recibir poemas semanales y actualizaciones por correo electrónico. Puede cancelar su suscripción en cualquier momento usando el enlace de cancelación proporcionado en cada correo electrónico o visitando nuestra página de cancelación de suscripción.",
                        "Nos reservamos el derecho de modificar o discontinuar el servicio de boletín en cualquier momento sin previo aviso.",
                    ],
                },
                {
                    title: "Contenido del Usuario",
                    paragraphs: [
                        "Si envía cualquier contenido a nuestro sitio web (como comentarios, comentarios u otros materiales), otorga a Amor Lento un derecho no exclusivo, libre de regalías, perpetuo, irrevocable y totalmente sublicenciable para usar, reproducir, modificar, adaptar, publicar, traducir, crear obras derivadas, distribuir y exhibir dicho contenido en todo el mundo en cualquier medio.",
                        "Usted declara y garantiza que es propietario o tiene los derechos necesarios para otorgar la licencia descrita anteriormente y que su contenido no viola ningún derecho de terceros.",
                    ],
                },
                {
                    title: "Usos Prohibidos",
                    paragraphs: [
                        "No puede usar nuestro sitio web:",
                        "• De cualquier manera que viole cualquier ley o regulación aplicable",
                        "• Para transmitir, o procurar el envío de, cualquier material publicitario o promocional sin nuestro consentimiento previo por escrito",
                        "• Para hacerse pasar o intentar hacerse pasar por Amor Lento, un empleado, otro usuario o cualquier otra persona o entidad",
                        "• De cualquier manera que infrinja los derechos de otros, o de cualquier manera que sea ilegal, amenazante, fraudulenta o dañina",
                        "• Para participar en cualquier otra conducta que restrinja o inhiba el uso o disfrute del sitio web de cualquier persona",
                    ],
                },
                {
                    title: "Descargo de Responsabilidad",
                    paragraphs: [
                        "Los materiales en el sitio web de Amor Lento se proporcionan 'tal cual'. Amor Lento no otorga garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, incluyendo, sin limitación, garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular o no infracción de propiedad intelectual u otra violación de derechos.",
                        "Además, Amor Lento no garantiza ni hace ninguna representación con respecto a la precisión, los resultados probables o la confiabilidad del uso de los materiales en su sitio web o de otra manera relacionado con dichos materiales o en cualquier sitio vinculado a este sitio.",
                    ],
                },
                {
                    title: "Limitación de Responsabilidad",
                    paragraphs: [
                        "En ningún caso Amor Lento o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a interrupción del negocio) que surja del uso o la incapacidad de usar los materiales en el sitio web de Amor Lento, incluso si Amor Lento o un representante autorizado ha sido notificado oralmente o por escrito de la posibilidad de tal daño.",
                    ],
                },
                {
                    title: "Revisiones y Erratas",
                    paragraphs: [
                        "Los materiales que aparecen en el sitio web de Amor Lento podrían incluir errores técnicos, tipográficos o fotográficos. Amor Lento no garantiza que ninguno de los materiales en su sitio web sea preciso, completo o actual.",
                        "Amor Lento puede hacer cambios en los materiales contenidos en su sitio web en cualquier momento sin previo aviso. Sin embargo, Amor Lento no se compromete a actualizar los materiales.",
                    ],
                },
                {
                    title: "Enlaces a Otros Sitios Web",
                    paragraphs: [
                        "Nuestro sitio web puede contener enlaces a sitios web o servicios de terceros que no son propiedad de o están controlados por Amor Lento. No tenemos control sobre, y no asumimos ninguna responsabilidad por, el contenido, las políticas de privacidad o las prácticas de cualquier sitio web o servicio de terceros.",
                        "Usted reconoce y acepta que Amor Lento no será responsable o responsable, directa o indirectamente, de ningún daño o pérdida causado o presuntamente causado por o en conexión con el uso o la dependencia de cualquier contenido, bienes o servicios disponibles en o a través de dichos sitios web o servicios.",
                    ],
                },
                {
                    title: "Terminación",
                    paragraphs: [
                        "Podemos terminar o suspender su acceso a nuestro sitio web inmediatamente, sin previo aviso o responsabilidad, por cualquier motivo, incluyendo sin limitación si viola los Términos de Servicio.",
                        "Al terminar, su derecho a usar el sitio web cesará inmediatamente.",
                    ],
                },
                {
                    title: "Ley Aplicable",
                    paragraphs: [
                        "Estos Términos de Servicio se regirán e interpretarán de acuerdo con las leyes de la jurisdicción en la que opera Amor Lento, sin tener en cuenta sus disposiciones de conflicto de leyes.",
                    ],
                },
                {
                    title: "Cambios a los Términos",
                    paragraphs: [
                        "Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos de Servicio en cualquier momento. Si una revisión es material, intentaremos proporcionar al menos 30 días de aviso antes de que cualquier nuevo término entre en vigor.",
                        "Al continuar accediendo o usando nuestro sitio web después de que cualquier revisión entre en vigor, acepta estar sujeto a los términos revisados.",
                    ],
                },
                {
                    title: "Información de Contacto",
                    paragraphs: [
                        "Si tiene alguna pregunta sobre estos Términos de Servicio, contáctenos en:",
                        "Correo electrónico: legal@amorlento.com",
                    ],
                },
            ],
        },
    }

    const t = content[locale]

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <section className="py-12 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl">
                            <h1 className="font-serif text-4xl font-bold text-balance mb-4 md:text-5xl">
                                {t.title}
                            </h1>
                            <p className="text-sm text-muted-foreground mb-8">
                                {t.lastUpdated} {t.lastUpdatedDate}
                            </p>

                            <div className="prose prose-rose max-w-none space-y-8">
                                {t.sections.map((section, index) => (
                                    <div key={index} className="space-y-4">
                                        <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                                            {section.title}
                                        </h2>
                                        {section.paragraphs.map((paragraph, pIndex) => (
                                            <p
                                                key={pIndex}
                                                className="text-base text-muted-foreground leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html: paragraph.replace(/\n/g, "<br />"),
                                                }}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

