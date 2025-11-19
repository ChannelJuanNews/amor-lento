"use client"

import { useLocale } from "@/lib/i18n/locale-context"
import { Navbar } from "@/components/core/navbar"
import { Footer } from "@/components/core/footer"

export default function PrivacyPage() {
    const { locale } = useLocale()

    const content = {
        en: {
            title: "Privacy Policy",
            lastUpdated: "Last Updated:",
            lastUpdatedDate: "December 2024",
            sections: [
                {
                    title: "Introduction",
                    paragraphs: [
                        "At Amor Lento, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website and use our services.",
                    ],
                },
                {
                    title: "Information We Collect",
                    paragraphs: [
                        "We collect information that you provide directly to us, including:",
                        "• Email address (when you subscribe to our newsletter)",
                        "• Name (if provided)",
                        "• Any content you submit through our website",
                        "• Automatically collected information such as IP address, browser type, device information, and usage data through cookies and similar technologies",
                    ],
                },
                {
                    title: "How We Use Your Information",
                    paragraphs: [
                        "We use the information we collect to:",
                        "• Send you weekly poems and newsletters (if you've subscribed)",
                        "• Respond to your inquiries and provide customer support",
                        "• Improve our website and services",
                        "• Analyze website usage and trends",
                        "• Comply with legal obligations",
                    ],
                },
                {
                    title: "Email Communications",
                    paragraphs: [
                        "If you subscribe to our newsletter, we will send you weekly poems and updates. You can unsubscribe at any time by clicking the unsubscribe link in any email or by visiting our unsubscribe page.",
                        "We use Resend to manage our email communications. Your email address is stored securely and is never shared with third parties for marketing purposes.",
                    ],
                },
                {
                    title: "Cookies and Tracking",
                    paragraphs: [
                        "We use cookies and similar tracking technologies to collect information about your browsing behavior. This helps us understand how visitors use our website and improve user experience.",
                        "You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.",
                    ],
                },
                {
                    title: "Data Storage and Security",
                    paragraphs: [
                        "We use Supabase to store and manage your data securely. All data is encrypted in transit and at rest. We implement appropriate technical and organizational measures to protect your personal information.",
                        "However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.",
                    ],
                },
                {
                    title: "Third-Party Services",
                    paragraphs: [
                        "We use the following third-party services that may collect information:",
                        "• Supabase (database and authentication)",
                        "• Resend (email delivery)",
                        "• Analytics services (to understand website usage)",
                        "These services have their own privacy policies, and we encourage you to review them.",
                    ],
                },
                {
                    title: "Your Rights",
                    paragraphs: [
                        "You have the right to:",
                        "• Access your personal information",
                        "• Correct inaccurate information",
                        "• Request deletion of your information",
                        "• Unsubscribe from our newsletter at any time",
                        "• Object to processing of your information",
                        "To exercise these rights, please contact us using the information provided below.",
                    ],
                },
                {
                    title: "Children's Privacy",
                    paragraphs: [
                        "Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.",
                    ],
                },
                {
                    title: "Changes to This Policy",
                    paragraphs: [
                        "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date.",
                        "You are advised to review this Privacy Policy periodically for any changes.",
                    ],
                },
                {
                    title: "Contact Us",
                    paragraphs: [
                        "If you have any questions about this Privacy Policy or our data practices, please contact us at:",
                        "Email: privacy@amorlento.com",
                    ],
                },
            ],
        },
        es: {
            title: "Política de Privacidad",
            lastUpdated: "Última actualización:",
            lastUpdatedDate: "Diciembre 2024",
            sections: [
                {
                    title: "Introducción",
                    paragraphs: [
                        "En Amor Lento, respetamos su privacidad y nos comprometemos a proteger su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos sus datos cuando visita nuestro sitio web y utiliza nuestros servicios.",
                    ],
                },
                {
                    title: "Información que Recopilamos",
                    paragraphs: [
                        "Recopilamos información que usted nos proporciona directamente, incluyendo:",
                        "• Dirección de correo electrónico (cuando se suscribe a nuestro boletín)",
                        "• Nombre (si se proporciona)",
                        "• Cualquier contenido que envíe a través de nuestro sitio web",
                        "• Información recopilada automáticamente como dirección IP, tipo de navegador, información del dispositivo y datos de uso a través de cookies y tecnologías similares",
                    ],
                },
                {
                    title: "Cómo Usamos Su Información",
                    paragraphs: [
                        "Utilizamos la información que recopilamos para:",
                        "• Enviarle poemas semanales y boletines (si se ha suscrito)",
                        "• Responder a sus consultas y brindar soporte al cliente",
                        "• Mejorar nuestro sitio web y servicios",
                        "• Analizar el uso del sitio web y las tendencias",
                        "• Cumplir con obligaciones legales",
                    ],
                },
                {
                    title: "Comunicaciones por Correo Electrónico",
                    paragraphs: [
                        "Si se suscribe a nuestro boletín, le enviaremos poemas semanales y actualizaciones. Puede cancelar su suscripción en cualquier momento haciendo clic en el enlace de cancelación en cualquier correo electrónico o visitando nuestra página de cancelación de suscripción.",
                        "Utilizamos Resend para gestionar nuestras comunicaciones por correo electrónico. Su dirección de correo electrónico se almacena de forma segura y nunca se comparte con terceros con fines de marketing.",
                    ],
                },
                {
                    title: "Cookies y Seguimiento",
                    paragraphs: [
                        "Utilizamos cookies y tecnologías de seguimiento similares para recopilar información sobre su comportamiento de navegación. Esto nos ayuda a entender cómo los visitantes usan nuestro sitio web y mejorar la experiencia del usuario.",
                        "Puede controlar las cookies a través de la configuración de su navegador. Sin embargo, deshabilitar las cookies puede limitar su capacidad para usar ciertas funciones de nuestro sitio web.",
                    ],
                },
                {
                    title: "Almacenamiento y Seguridad de Datos",
                    paragraphs: [
                        "Utilizamos Supabase para almacenar y gestionar sus datos de forma segura. Todos los datos están cifrados en tránsito y en reposo. Implementamos medidas técnicas y organizativas apropiadas para proteger su información personal.",
                        "Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por proteger sus datos, no podemos garantizar una seguridad absoluta.",
                    ],
                },
                {
                    title: "Servicios de Terceros",
                    paragraphs: [
                        "Utilizamos los siguientes servicios de terceros que pueden recopilar información:",
                        "• Supabase (base de datos y autenticación)",
                        "• Resend (entrega de correo electrónico)",
                        "• Servicios de análisis (para entender el uso del sitio web)",
                        "Estos servicios tienen sus propias políticas de privacidad, y le recomendamos que las revise.",
                    ],
                },
                {
                    title: "Sus Derechos",
                    paragraphs: [
                        "Usted tiene derecho a:",
                        "• Acceder a su información personal",
                        "• Corregir información inexacta",
                        "• Solicitar la eliminación de su información",
                        "• Cancelar su suscripción a nuestro boletín en cualquier momento",
                        "• Oponerse al procesamiento de su información",
                        "Para ejercer estos derechos, contáctenos utilizando la información proporcionada a continuación.",
                    ],
                },
                {
                    title: "Privacidad de Menores",
                    paragraphs: [
                        "Nuestro sitio web no está dirigido a niños menores de 13 años. No recopilamos intencionalmente información personal de niños menores de 13 años. Si cree que hemos recopilado información de un niño menor de 13 años, contáctenos inmediatamente.",
                    ],
                },
                {
                    title: "Cambios a Esta Política",
                    paragraphs: [
                        "Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de 'Última actualización'.",
                        "Se le recomienda revisar esta Política de Privacidad periódicamente para ver cualquier cambio.",
                    ],
                },
                {
                    title: "Contáctenos",
                    paragraphs: [
                        "Si tiene alguna pregunta sobre esta Política de Privacidad o nuestras prácticas de datos, contáctenos en:",
                        "Correo electrónico: privacy@amorlento.com",
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

