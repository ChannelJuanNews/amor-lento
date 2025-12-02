export const dictionaries = {
    en: {
        nav: {
            home: "Home",
            poems: "Poems",
            loveLetters: "Love Letters",
            textMessages: "Text Messages",
            shop: "Shop",
            customPoem: "Custom Poem",
            newsletter: "Newsletter",
            about: "About",
        },
        hero: {
            headline: "Love at a human pace.",
            subheadline: "Original poems, love letters, and gifts that linger.",
            ctaPrimary: "Read Poems",
            ctaSecondary: "Shop Gifts",
            ctaTertiary: "Commission a Poem",
        },
        shop: {
            title: "Shop",
            subtitle: "Curated gifts for slow love. Each piece crafted with intention.",
        },
        common: {
            readMore: "Read More",
            addToCart: "Add to Cart",
            subscribe: "Subscribe",
            submit: "Submit",
            loading: "Loading...",
            error: "Something went wrong",
            success: "Success!",
        },
        footer: {
            tagline: "where love lingers longer",
            followUs: "Follow Us",
            legal: "Legal",
            privacy: "Privacy",
            terms: "Terms",
        },
    },
    es: {
        nav: {
            home: "Inicio",
            poems: "Poemas",
            loveLetters: "Cartas de Amor",
            textMessages: "Mensajes de Texto",
            shop: "Tienda",
            customPoem: "Poema Personalizado",
            newsletter: "Boletín",
            about: "Acerca",
        },
        hero: {
            headline: "Amor a un ritmo humano.",
            subheadline: "Poemas originales, cartas y regalos que perduran.",
            ctaPrimary: "Leer Poemas",
            ctaSecondary: "Ver Regalos",
            ctaTertiary: "Encargar un Poema",
        },
        shop: {
            title: "Tienda",
            subtitle: "Regalos seleccionados para el amor lento. Cada pieza hecha con intención.",
        },
        common: {
            readMore: "Leer Más",
            addToCart: "Añadir al Carrito",
            subscribe: "Suscribirse",
            submit: "Enviar",
            loading: "Cargando...",
            error: "Algo salió mal",
            success: "Éxito!",
        },
        footer: {
            tagline: "donde el amor perdura más",
            followUs: "Síguenos",
            legal: "Legal",
            privacy: "Privacidad",
            terms: "Términos",
        },
    },
} as const

export type Locale = keyof typeof dictionaries
export type Dictionary = typeof dictionaries.en
