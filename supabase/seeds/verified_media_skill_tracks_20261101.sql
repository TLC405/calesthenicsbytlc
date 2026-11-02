-- Verified by matching public exercise tutorial names/content and specific published sources.
-- Existing video links remain unchanged; this does not create guessed video IDs.
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=vpPjY4BtJuI', video_verified = true WHERE slug = 'ring-muscle-up' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=vpPjY4BtJuI', video_verified = true WHERE slug = 'ring-muscle-up-transition-drill' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=TIMMk2mEPeE', video_verified = true WHERE slug = 'false-grip-ring-hang' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=TIMMk2mEPeE', video_verified = true WHERE slug = 'false-grip-ring-row' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=IEapGjp_KAo', video_verified = true WHERE slug = 'middle-split-frog-stretch' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=BMUmyW1jepU', video_verified = true WHERE slug = '90-90-hip-switches' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=0GN-b3Q4dog', video_verified = true WHERE slug = 'press-hs-journey' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=HhdLEp2pETg', video_verified = true WHERE slug = 'seated-straddle-compression-lift' AND (youtube_url IS NULL OR btrim(youtube_url) = '');
UPDATE public.exercises SET youtube_url = 'https://www.youtube.com/watch?v=-ZIpSoTRsuE', video_verified = true WHERE slug = 'scapular-pull-up' AND (youtube_url IS NULL OR btrim(youtube_url) = '');

-- Distinct progression families; preserve categories and exercise identity.
UPDATE public.exercises SET chain_group = 'planche-chain', chain_order = 1 WHERE slug = 'planche-plank' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'planche-chain', chain_order = 2 WHERE slug = 'planche-lean' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'planche-chain', chain_order = 3 WHERE slug = 'parallette-tuck-planche' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'planche-chain', chain_order = 4 WHERE slug = 'tuck-planche' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'planche-chain', chain_order = 5 WHERE slug = 'advanced-tuck-planche' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'planche-chain', chain_order = 6 WHERE slug = 'straddle-planche' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'planche-chain', chain_order = 7 WHERE slug = 'full-planche' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'straddle-press-chain', chain_order = 1 WHERE slug = 'straddle-stretch' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'straddle-press-chain', chain_order = 2 WHERE slug = 'seated-straddle-compression-lift' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'straddle-press-chain', chain_order = 3 WHERE slug = 'seated-straddle-lift' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'straddle-press-chain', chain_order = 4 WHERE slug = 'press-hs-journey' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'straddle-press-chain', chain_order = 5 WHERE slug = 'straddle-hs-kick-up' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'straddle-press-chain', chain_order = 6 WHERE slug = 'straddle-press-to-hs' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'straddle-press-chain', chain_order = 7 WHERE slug = 'stalder-press-to-hs' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'handstand-chain', chain_order = 1 WHERE slug = 'wall-handstand' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'handstand-chain', chain_order = 2 WHERE slug = 'chest-to-wall-handstand-hold' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'handstand-chain', chain_order = 3 WHERE slug = 'handstand-bail' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'handstand-chain', chain_order = 4 WHERE slug = 'handstand-heel-pull' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'handstand-chain', chain_order = 5 WHERE slug = 'freestanding-handstand-kick-up' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'handstand-chain', chain_order = 6 WHERE slug = 'freestanding-handstand' AND created_by IS NULL;
UPDATE public.exercises SET chain_group = 'handstand-chain', chain_order = 7 WHERE slug = 'l-sit-to-handstand' AND created_by IS NULL;
