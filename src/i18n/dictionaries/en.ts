import type { Dictionary } from "./fr";

const en: Dictionary = {
  meta: {
    tagline: "Your best stream moments, edited in a few clicks",
    description:
      "Condensé finds the highlights of your Twitch streams from chat, audio and transcript, then lets you assemble them into a best-of on a timeline. Free.",
    keywords: [
      "stream highlights",
      "Twitch best-of",
      "Twitch VOD editor",
      "stream highlight finder",
      "Twitch clips",
      "video editing for streamers",
      "VOD to YouTube",
      "video transcription",
    ],
    pages: {
      features: {
        title: "Features",
        description:
          "Highlight detection, word-level transcript, clean cuts, an editing timeline and YouTube-ready exports: everything Condensé does.",
      },
      pricing: {
        title: "Pricing",
        description: "Condensé is free during the beta, no credit card required. See what's coming with Pro.",
      },
      about: {
        title: "About",
        description: "Why we're building Condensé: making best-of editing accessible to every streamer.",
      },
      contact: { title: "Contact", description: "A question, an idea, a problem? Write to us." },
      notice: { title: "Legal notice", description: "Legal notice for the Condensé website." },
      terms: { title: "Terms of service", description: "Terms of service for Condensé." },
      privacy: {
        title: "Privacy policy",
        description: "What data Condensé collects, why, and how to exercise your rights.",
      },
      cookies: { title: "Cookies", description: "Cookies and local storage used by Condensé." },
      signIn: { title: "Sign in", description: "Sign in to your Condensé account." },
      signUp: { title: "Create an account", description: "Create your free Condensé account." },
      forgotPassword: { title: "Forgot password", description: "Get a link to reset your password." },
      resetPassword: { title: "New password", description: "Choose a new password." },
      dashboard: { title: "My projects", description: "" },
      newProject: { title: "New project", description: "" },
      settings: { title: "Settings", description: "" },
    },
  },

  nav: {
    features: "Features",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
    signIn: "Sign in",
    getStarted: "Get started free",
    dashboard: "My projects",
    openMenu: "Open menu",
    skipToContent: "Skip to content",
  },

  footer: {
    tagline: "Best-of editing for streamers, without the all-nighter.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    rights: "All rights reserved.",
  },

  home: {
    hero: {
      badge: "Free during the beta",
      title: "Your best stream moments,",
      titleHighlight: "edited in a few clicks",
      subtitle:
        "Import your stream's VOD. Condensé finds the highlights from chat, audio and what you say, then you assemble them into a best-of on a real timeline.",
      ctaPrimary: "Get started free",
      ctaSecondary: "See how it works",
      note: "No credit card · Works with Twitch VODs and your own files",
    },
    mock: {
      library: "Detected highlights",
      timeline: "Edit",
      playing: "Playing",
      clips: ["The 1v4 clutch", "Laughing with chat", "The most absurd fall", "Boss finally down", "Surprise raid"],
    },
    steps: {
      eyebrow: "How it works",
      title: "From a 10-hour stream to a 15-minute video",
      items: [
        {
          title: "Import your stream",
          text: "Paste your Twitch VOD link or upload the file, even tens of gigabytes.",
        },
        {
          title: "We find the highlights",
          text: "Chat spikes, reactions, rising voices, memorable lines: every strong moment becomes a tight clip.",
        },
        {
          title: "You edit, we export",
          text: "Watch, trim to the second, drag onto the timeline. The export is ready for YouTube.",
        },
      ],
    },
    features: {
      eyebrow: "Features",
      title: "Everything a best-of editor would do, fast-forwarded",
      items: [
        {
          title: "Highlight detection",
          text: "Chat, audio and transcript are combined to find the moments people reacted to.",
        },
        {
          title: "Word-level transcript",
          text: "Read what's said in each clip and click any word to jump there.",
        },
        {
          title: "Clean cuts",
          text: "Cuts snap to pauses: never a sentence chopped mid-word.",
        },
        {
          title: "A real timeline",
          text: "Reorder your clips with drag and drop, just like in your editing software.",
        },
        {
          title: "Direct Twitch import",
          text: "One link is enough: the VOD and its chat replay are fetched automatically.",
        },
        {
          title: "YouTube-ready",
          text: "Normalized loudness, frame-accurate cuts and chapters generated for your description.",
        },
      ],
    },
    editor: {
      eyebrow: "The editor",
      title: "Stay in control of every second",
      text: "Automation does the heavy lifting, you get the final say. Every highlight trims to a tenth of a second, and the whole edit plays back before you export.",
      points: [
        "Set in and out points with handles, buttons or a word in the transcript",
        "Play the whole edit back to back, with a playhead",
        "Any order you like: no need to follow the stream's timeline",
      ],
    },
    useCases: {
      eyebrow: "Who it's for",
      title: "Built for streamers and their editors",
      items: [
        { title: "Weekly best-of", text: "Condense your streams into a regular YouTube video." },
        { title: "Let's play episodes", text: "Keep the story, cut the dead air." },
        { title: "Clips for social media", text: "Find the moments worth sharing in minutes." },
      ],
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Is it really free?",
          a: "Yes. During the beta, every feature is free, no credit card required. A Pro plan will come later with advanced options; the free plan will stay.",
        },
        {
          q: "What videos can I import?",
          a: "Public Twitch VODs (with just a link) and your own video files (MP4, MKV, MOV…). Streams of several hours are supported.",
        },
        {
          q: "How are highlights chosen?",
          a: "Condensé analyzes chat activity and reactions, audio intensity and what's being said (transcript). Moments that stand out become short clips you can adjust.",
        },
        {
          q: "How long does the analysis take?",
          a: "It depends on the stream's length: from a few minutes to about an hour for a very long stream. You can close the page, processing continues.",
        },
        {
          q: "Who owns the videos I make?",
          a: "You do. You keep ownership of your content; we only use it to produce your edits.",
        },
        {
          q: "Do subscriber-only VODs work?",
          a: "Not directly. Make the VOD public while importing, or download it and upload the file.",
        },
      ],
    },
    cta: {
      title: "Your next best-of starts here",
      text: "Import a stream, let Condensé find the highlights, export your video.",
      button: "Create my free account",
    },
  },

  featuresPage: {
    eyebrow: "Features",
    title: "From raw stream to final video",
    subtitle: "Every step of making a best-of, automated where it helps, adjustable where it matters.",
    sections: [
      {
        title: "Frictionless import",
        text: "Paste a Twitch VOD link or upload a file. Large files go straight to storage in chunks, with automatic resume if the connection drops.",
        points: ["Public Twitch VODs and chat replay", "MP4, MKV, MOV files, even very large ones", "Real-time progress"],
      },
      {
        title: "Highlight detection",
        text: "Several signals are combined: chat message spikes and reactions, voice and sound intensity, memorable phrases in the transcript. Dead air and sub shout-outs are left out.",
        points: ["About one highlight per six minutes of stream", "Clips trimmed as tight as possible", "A score and category for every moment"],
      },
      {
        title: "Built-in transcript",
        text: "Everything said is transcribed with the timing of each word. In the editor, the transcript follows playback and helps you cut in the right place.",
        points: ["Word-level timestamps", "Click a word to jump there", "Transcribed without third-party services"],
      },
      {
        title: "Editor and timeline",
        text: "Watch each highlight, adjust its start and end, then build your edit on a horizontal timeline, in whatever order you like.",
        points: ["Cuts snap to pauses between words", "Drag and drop, with zoom", "Back-to-back playback of the edit"],
      },
      {
        title: "Ready-to-publish export",
        text: "The render honors your cuts to the frame, smooths every join and normalizes loudness to the level YouTube expects.",
        points: ["Loudness normalized to -14 LUFS", "YouTube chapters generated", "MP4 download"],
      },
    ],
  },

  pricing: {
    eyebrow: "Pricing",
    title: "Free during the beta",
    subtitle: "Every feature, no credit card. A Pro plan is coming for creators who want to go further.",
    free: {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Everything you need to edit your best-ofs.",
      features: [
        "Twitch VOD and file import",
        "Automatic highlight detection",
        "Word-level transcript",
        "Editor with timeline",
        "YouTube-ready MP4 export",
      ],
      cta: "Get started free",
    },
    pro: {
      name: "Pro",
      badge: "Soon",
      price: "Coming soon",
      description: "For creators who publish often.",
      features: [
        "AI-generated titles and summaries",
        "Faster analysis and transcription",
        "1080p60 export",
        "Long-term storage",
        "Priority support",
      ],
      cta: "Get notified",
    },
    faqTitle: "Pricing questions",
    faq: [
      {
        q: "Will the free plan go away?",
        a: "No. Pro will add options; the free plan will remain available.",
      },
      {
        q: "Do I need a credit card?",
        a: "No, neither to sign up nor to use Condensé during the beta.",
      },
    ],
  },

  about: {
    eyebrow: "About",
    title: "Making best-ofs accessible to every streamer",
    paragraphs: [
      "A stream that lasts hours often holds a few unforgettable minutes. Finding them means rewatching everything, then cutting, assembling, exporting: hours of work many streamers don't have.",
      "Condensé automates the tedious part — finding highlights, cutting them cleanly, preparing the export — and leaves you the creative part: choosing, ordering, storytelling.",
      "The product is in beta and moving fast. Your feedback shapes what comes next: write to us.",
    ],
  },

  contact: {
    eyebrow: "Contact",
    title: "Let's talk",
    subtitle: "A question, a feature idea, a bug? We read every message.",
    emailLabel: "Write to us",
    responseTime: "We usually reply within 2 business days.",
    topics: [
      { title: "Support", text: "An import stuck, an error? Tell us the project name and what you did." },
      { title: "Ideas", text: "Tell us what would save you time on your edits." },
      { title: "Personal data", text: "To exercise your rights (access, deletion…), write from your account's email address." },
    ],
  },

  legal: {
    updated: "Last updated: {date}",
    notice: {
      title: "Legal notice",
      sections: [
        {
          title: "Publisher",
          body: [
            "The {site} website is published by {company}, {address}, registered under number {registration}.",
            "Publication director: {director}. Contact: {email}.",
          ],
        },
        { title: "Hosting", body: ["{host}"] },
        {
          title: "Intellectual property",
          body: [
            "The site's elements (brand, texts, interface) are protected. Videos imported by users remain their property.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of service",
      sections: [
        {
          title: "Purpose",
          body: [
            "These terms govern the use of {site}, a service that analyzes stream videos to extract highlights and produce edits.",
          ],
        },
        {
          title: "Account",
          body: [
            "An account is required to use the service. You are responsible for keeping your password confidential and for activity on your account.",
          ],
        },
        {
          title: "Your content",
          body: [
            "Only import videos you hold the necessary rights to. You keep ownership of your content and only grant us the right to process it to provide the service.",
            "Illegal content is prohibited. We may remove any content reported as such.",
          ],
        },
        {
          title: "Availability",
          body: [
            "The service is provided as a beta, as is. We do our best to keep it available and reliable but cannot guarantee it. Remember to download your exports.",
          ],
        },
        {
          title: "Liability",
          body: [
            "To the extent permitted by law, we are not liable for indirect damages arising from the use of the service.",
          ],
        },
        {
          title: "Termination",
          body: [
            "You can delete your account at any time from the settings; your projects and files are then deleted.",
          ],
        },
        {
          title: "Governing law",
          body: ["These terms are governed by French law."],
        },
      ],
    },
    privacy: {
      title: "Privacy policy",
      sections: [
        {
          title: "Data controller",
          body: ["{company}, {address}. Contact: {email}."],
        },
        {
          title: "Data we collect",
          body: [
            "Account: name, email address, password (stored hashed).",
            "Projects: the videos you import, their audio, transcript, the chat replay of Twitch VODs, detected highlights and your edits.",
            "Technical: IP address and browser, tied to your sign-in session.",
          ],
        },
        {
          title: "Purposes",
          body: [
            "Providing the service (analysis, editing, export), securing your account and answering your requests. We don't use your data for advertising and don't sell it.",
          ],
        },
        {
          title: "Processors",
          body: [
            "Transcription and analysis run on our servers, without third-party services. Files are stored with our host: {host}.",
          ],
        },
        {
          title: "Retention",
          body: [
            "Your data is kept as long as your account exists. Deleting a project erases its files; deleting your account erases all your data.",
          ],
        },
        {
          title: "Your rights",
          body: [
            "You have the right to access, rectify, erase, port and object. Write to {email}. You may also lodge a complaint with your data protection authority.",
          ],
        },
      ],
    },
    cookies: {
      title: "Cookies",
      sections: [
        {
          title: "Cookies we use",
          body: [
            "Session cookie: keeps you signed in. Required for the service.",
            "Language cookie: remembers the language you chose.",
            "Browser local storage: remembers your theme (light or dark).",
          ],
        },
        {
          title: "No trackers",
          body: [
            "We use no advertising cookies and no third-party analytics. Since these cookies are strictly necessary, no consent is required.",
          ],
        },
      ],
    },
  },

  notFound: {
    title: "Page not found",
    text: "This page doesn't exist or has moved.",
    home: "Back to home",
  },

  app: {
    common: {
      back: "Back",
      cancel: "Cancel",
      delete: "Delete",
      loading: "Loading…",
      save: "Save",
      saved: "Saved",
      retry: "Try again",
      genericError: "Something went wrong. Please try again.",
    },
    theme: { label: "Theme", light: "Light", dark: "Dark", system: "System" },
    language: { label: "Language" },
    account: { settings: "Settings", signOut: "Sign out", menu: "Account" },
    auth: {
      name: "Name",
      namePlaceholder: "Your handle",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordHint: "At least 8 characters",
      newPassword: "New password",
      signIn: {
        title: "Welcome back",
        description: "Sign in to get back to your projects.",
        submit: "Sign in",
        forgot: "Forgot password?",
        noAccount: "No account yet?",
        signUpLink: "Create one",
      },
      signUp: {
        title: "Create an account",
        description: "Free, no credit card.",
        submit: "Create my account",
        hasAccount: "Already have an account?",
        signInLink: "Sign in",
        terms: "By creating an account, you agree to the {terms} and the {privacy}.",
        termsLink: "terms of service",
        privacyLink: "privacy policy",
      },
      forgot: {
        title: "Forgot password",
        description: "Enter your email and we'll send you a reset link.",
        submit: "Send link",
        sent: "If an account exists for this address, an email has just been sent.",
        back: "Back to sign in",
      },
      reset: {
        title: "New password",
        description: "Choose a new password for your account.",
        submit: "Change password",
        done: "Password changed. You can now sign in.",
        invalidLink: "This link is invalid or has expired. Request a new one.",
      },
      errors: {
        INVALID_EMAIL_OR_PASSWORD: "Incorrect email or password.",
        USER_ALREADY_EXISTS: "An account already exists with this email.",
        USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account already exists with this email.",
        PASSWORD_TOO_SHORT: "Password is too short (at least 8 characters).",
        INVALID_PASSWORD: "Incorrect password.",
        INVALID_TOKEN: "This link is invalid or has expired.",
      },
    },
    dashboard: {
      title: "My projects",
      greeting: "Hi {name}",
      newProject: "New project",
      emptyTitle: "No projects yet",
      emptyText: "Import a stream's VOD: we find the highlights, you build your best-of.",
      liveOf: "{duration} stream",
      highlights: "{count} highlights",
      importing: "Importing",
    },
    newProject: {
      title: "New project",
      description: "Import your stream's VOD: we find every highlight, you build your edit.",
      tabFile: "Video file",
      tabTwitch: "Twitch VOD",
      fileLabel: "VOD file (MP4, MKV, MOV…)",
      twitchLabel: "VOD link",
      twitchHint: "The chat replay is fetched too, to help find highlights.",
      titleLabel: "Title",
      titlePlaceholder: "Best-of from March 12",
      untitled: "Untitled stream",
      submit: "Start",
      creating: "Creating…",
      uploading: "Uploading…",
      uploadProgress: "Uploading · {done} / {total}",
      chooseFile: "Choose a video file.",
      uploadFailed: "Upload failed.",
    },
    status: {
      PENDING_UPLOAD: "Awaiting upload",
      QUEUED: "Queued",
      INGESTING: "Preparing",
      INGESTED: "Analysis pending",
      ANALYZING: "Analyzing",
      REVIEW: "Ready to edit",
      RENDERING: "Exporting",
      DONE: "Done",
      FAILED: "Failed",
    },
    stages: {
      queued: "Queued",
      download_vod: "Downloading the VOD",
      download_chat: "Fetching the chat",
      archive_vod: "Storing the video",
      probe: "Reading the file",
      extract_audio: "Extracting audio",
      transcribe: "Transcribing the stream",
      signals: "Analyzing audio and chat",
      highlights: "Finding highlights",
      thumbnails: "Creating thumbnails",
      render: "Rendering the video",
      upload_output: "Finishing up",
      waiting: "Waiting for a server…",
    },
    errors: {
      unauthenticated: "You need to be signed in.",
      not_found: "Project not found.",
      invalid_request: "Invalid request.",
      invalid_twitch_url: "Invalid Twitch VOD link.",
      file_too_large: "File too large (100 GB max).",
      busy: "Processing in progress, try again once it's done.",
      no_upload: "No upload in progress.",
      not_editable: "The edit can't be changed right now.",
      empty_montage: "Add at least one highlight to the edit.",
      unknown_highlight: "Unknown highlight.",
      duplicate_highlight: "A highlight can only appear once in the edit.",
      invalid_bounds: "Each clip must last at least 1 second and stay within the video.",
      nothing_to_retry: "Nothing to retry.",
      enqueue_failed: "Couldn't start processing. Try again in a moment.",
      unreadable_file: "Unreadable video file or unsupported format.",
      no_video: "No usable video track in the file.",
      no_audio: "The video has no audio track: highlights can't be detected.",
      no_speech: "No speech detected in the video: highlights can't be found.",
      vod_sub_only: "This VOD is subscriber-only. Make it public while importing, or upload the file.",
      vod_unavailable: "Couldn't download the VOD. Check that it's public and still online.",
      disk_space: "Not enough disk space to import this VOD: about {needed} GB needed, {free} GB available.",
      transcription_unavailable: "Transcription is unavailable right now.",
      analysis_unavailable: "Analysis is unavailable right now.",
      montage_empty: "The edit is empty.",
      interrupted: "Processing was interrupted (server stopped, out of memory or disk space). You can retry.",
      internal: "Internal error during processing. Please try again later.",
    },
    project: {
      delete: "Delete",
      confirmDelete: "Delete this project and all its files?",
      deleteFailed: "Couldn't delete.",
      failedTitle: "Processing failed",
      retry: "Retry",
      retryFailed: "Couldn't retry.",
      legacyTitle: "Video ready",
      legacyText: "This video was imported before automatic analysis existed.",
      legacyButton: "Start analysis",
      details: "Details",
      source: "Source",
      size: "Size",
      duration: "Stream length",
      video: "Video",
      chat: "Chat",
      chatOk: "Fetched",
      chatMissing: "Unavailable",
      file: "File",
      finalVideo: "Final video",
      download: "Download",
      copyChapters: "Copy YouTube chapters",
      chaptersCopied: "Chapters copied",
      copyFailed: "Couldn't copy",
      editMontage: "Edit the video",
    },
    editor: {
      noPreview: "Preview unavailable",
      playClip: "Play clip",
      addToMontage: "Add to edit",
      addAfter: "Add after #{index}",
      removeFromMontage: "Remove from edit",
      inLive: "at {time} in the stream",
      duration: "Length: {duration}",
      start: "Start",
      end: "End",
      here: "Here",
      hereTitle: "Set to the current frame",
      transcript: "Transcript · click a word to jump there, then “Here” to cut.",
      noSpeech: "No speech in this section.",
      highlightsCount: "{count} highlights",
      sortChrono: "Stream order",
      sortBest: "Best",
      addAll: "Add all to edit",
      playMontage: "Play edit",
      pause: "Pause",
      clipsCount: "{count} clip(s)",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      emptyTimeline: "Drag highlights here, or open one and click “Add to edit”.",
      removeClip: "Remove from edit",
      insertHere: "New clips will be inserted here",
      snap: "Snap cuts to pauses (never cut a word)",
      export: "Export video",
      exporting: "Starting…",
      exportFailed: "Couldn't start the export.",
      saveFailed: "Changes not saved.",
    },
    categories: {
      humour: "Humor",
      action: "Action",
      exploit: "Clutch",
      echec: "Fail",
      reaction: "Reaction",
      histoire: "Story",
      discussion: "Talk",
      interaction_chat: "Chat",
      gameplay: "Gameplay",
      temps_mort: "Dead air",
    },
    settings: {
      title: "Settings",
      profile: "Profile",
      profileText: "The name shown in the app.",
      password: "Password",
      passwordText: "Change your password. Your other sessions will be signed out.",
      currentPassword: "Current password",
      changePassword: "Change password",
      passwordChanged: "Password changed.",
      preferences: "Preferences",
      preferencesText: "Interface language and appearance.",
      danger: "Delete account",
      dangerText: "Permanently deletes your account, your projects and all your files.",
      deleteAccount: "Delete my account",
      confirmDelete: "Enter your password to confirm permanent deletion.",
      deleted: "Account deleted.",
    },
  },
};

export default en;
