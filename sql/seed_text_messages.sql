-- Seed text_messages table with example conversations

-- 1. Morning Coffee (English)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Morning Coffee',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=5',
    '[
        {"sender": "contact", "text": "Good morning my love! ☕", "timestamp": "2025-12-01T09:00:00Z"},
        {"sender": "user", "text": "Good morning beautiful! How did you sleep?", "timestamp": "2025-12-01T09:01:00Z"},
        {"sender": "contact", "text": "Dreamt of you all night ❤️", "timestamp": "2025-12-01T09:02:00Z"}
    ]'::jsonb,
    'I can''t wait to hold you tonight',
    'en',
    ARRAY['morning', 'coffee', 'sweet'],
    'published',
    NOW()
);

-- 2. Buenos Días (Spanish)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Buenos Días Mi Amor',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=9',
    '[
        {"sender": "user", "text": "Buenos días mi amor Genesis ❤️", "timestamp": "2025-12-01T08:00:00Z"},
        {"sender": "contact", "text": "Buenos días mi vida! Cómo amaneciste?", "timestamp": "2025-12-01T08:01:00Z"},
        {"sender": "user", "text": "Pensando en ti, como siempre. Eres mi todo 🥰", "timestamp": "2025-12-01T08:02:00Z"}
    ]'::jsonb,
    'Te amo con todo mi corazón',
    'es',
    ARRAY['amor', 'mañana', 'romántico'],
    'published',
    NOW()
);

-- 3. Thinking of You (English)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Thinking of You',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=1',
    '[
        {"sender": "user", "text": "Hey beautiful Genesis, just thinking about you ❤️", "timestamp": "2025-11-30T19:00:00Z"},
        {"sender": "contact", "text": "Aww, I was just thinking about you too! What are you up to?", "timestamp": "2025-11-30T19:05:00Z"},
        {"sender": "user", "text": "Just missing you and counting down until I see you again 😊", "timestamp": "2025-11-30T19:07:00Z"}
    ]'::jsonb,
    'You make every day brighter',
    'en',
    ARRAY['thinking', 'romantic', 'cute'],
    'published',
    NOW()
);

-- 4. Late Night (English)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Late Night Thoughts',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=12',
    '[
        {"sender": "contact", "text": "You still up my love?", "timestamp": "2025-12-01T23:30:00Z"},
        {"sender": "user", "text": "Yeah, can''t sleep without you next to me. You?", "timestamp": "2025-12-01T23:31:00Z"},
        {"sender": "contact", "text": "Same. I keep thinking about how lucky I am to have you ❤️", "timestamp": "2025-12-01T23:32:00Z"}
    ]'::jsonb,
    'Sweet dreams beautiful, I love you',
    'en',
    ARRAY['late-night', 'deep', 'thoughtful'],
    'published',
    NOW()
);

-- 5. Te Extraño (Spanish)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Te Extraño',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=13',
    '[
        {"sender": "user", "text": "Te extraño mucho mi amor Genesis ❤️", "timestamp": "2025-12-01T15:00:00Z"},
        {"sender": "contact", "text": "Yo también te extraño mi vida, cada segundo sin ti es difícil", "timestamp": "2025-12-01T15:01:00Z"},
        {"sender": "user", "text": "Pronto estaré contigo. No puedo esperar a abrazarte y besarte", "timestamp": "2025-12-01T15:02:00Z"}
    ]'::jsonb,
    'Eres mi todo',
    'es',
    ARRAY['extrañar', 'distancia', 'amor'],
    'published',
    NOW()
);

-- 6. Rainy Day (English)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Rainy Day',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=23',
    '[
        {"sender": "contact", "text": "It''s pouring outside 🌧️ Perfect day to cuddle with you", "timestamp": "2025-12-01T14:00:00Z"},
        {"sender": "user", "text": "I wish I was there right now to hold you close ❤️", "timestamp": "2025-12-01T14:01:00Z"},
        {"sender": "contact", "text": "Me too my love. You make everything better", "timestamp": "2025-12-01T14:02:00Z"}
    ]'::jsonb,
    'I love you more than words can say',
    'en',
    ARRAY['cozy', 'rain', 'sweet'],
    'published',
    NOW()
);

-- 7. Goodnight (English)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Goodnight Text',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=16',
    '[
        {"sender": "user", "text": "Goodnight my beautiful wife Genesis ❤️", "timestamp": "2025-12-01T22:00:00Z"},
        {"sender": "contact", "text": "Goodnight my love 💕 Today was perfect because I spent it with you", "timestamp": "2025-12-01T22:01:00Z"},
        {"sender": "user", "text": "Every day with you is perfect. Sweet dreams, I love you", "timestamp": "2025-12-01T22:02:00Z"}
    ]'::jsonb,
    'Dream of me',
    'en',
    ARRAY['goodnight', 'sweet', 'romantic'],
    'published',
    NOW()
);

-- 8. Mi Amor (Spanish)
INSERT INTO public.text_messages (
    title,
    contact_name,
    contact_image,
    messages,
    draft_message,
    lang,
    tags,
    status,
    published_at
) VALUES (
    'Mi Amor',
    'Genesis Ruelas',
    'https://i.pravatar.cc/150?img=10',
    '[
        {"sender": "user", "text": "Hola mi amor Genesis, solo quería decirte que te amo ❤️", "timestamp": "2025-11-29T18:00:00Z"},
        {"sender": "contact", "text": "Hola mi vida! Yo también te amo mucho 😊 Eres mi todo", "timestamp": "2025-11-29T18:05:00Z"},
        {"sender": "user", "text": "Eres la mejor parte de mi día, cada día", "timestamp": "2025-11-29T18:06:00Z"}
    ]'::jsonb,
    'Eres mi mundo completo',
    'es',
    ARRAY['amor', 'romántico', 'lindo'],
    'published',
    NOW()
);
