export const SUBJECTS = [
  {
    id: "math",
    nameEn: "Mathematics",
    nameAm: "ሂሳብ",
    icon: "📐",
    color: "#1B3A6B",
    bgClass: "subject-math",
    gradient: "from-blue-900 to-blue-700",
    description: "Algebra, Calculus, Geometry, Statistics and more",
    topics: [
      "Linear Equations",
      "Quadratic Equations",
      "Functions",
      "Trigonometry",
      "Calculus",
      "Statistics",
      "Matrices",
      "Sequences and Series",
      "Probability",
      "Coordinate Geometry",
    ],
  },
  {
    id: "english",
    nameEn: "English",
    nameAm: "እንግሊዝኛ",
    icon: "📚",
    color: "#2E7D32",
    bgClass: "subject-english",
    gradient: "from-green-800 to-green-600",
    description: "Grammar, Vocabulary, Reading Comprehension and Writing",
    topics: [
      "Grammar",
      "Vocabulary",
      "Reading Comprehension",
      "Writing Skills",
      "Idioms and Phrases",
      "Literary Devices",
      "Sentence Structure",
      "Parts of Speech",
      "Tenses",
      "Reported Speech",
    ],
  },
  {
    id: "biology",
    nameEn: "Biology",
    nameAm: "ባዮሎጂ",
    icon: "🔬",
    color: "#00838F",
    bgClass: "subject-biology",
    gradient: "from-cyan-700 to-teal-600",
    description: "Cell Biology, Genetics, Human Anatomy and Evolution",
    topics: [
      "Cell Biology",
      "Genetics",
      "Human Anatomy",
      "Plant Biology",
      "Ecology",
      "Evolution",
      "Microbiology",
      "Biochemistry",
      "Reproduction",
      "Nervous System",
    ],
  },
  {
    id: "chemistry",
    nameEn: "Chemistry",
    nameAm: "ኬሚስትሪ",
    icon: "⚗️",
    color: "#E65100",
    bgClass: "subject-chemistry",
    gradient: "from-orange-700 to-amber-600",
    description: "Atomic Structure, Chemical Reactions, Organic Chemistry",
    topics: [
      "Atomic Structure",
      "Periodic Table",
      "Chemical Bonding",
      "Chemical Reactions",
      "Acids and Bases",
      "Thermochemistry",
      "Electrochemistry",
      "Organic Chemistry",
      "The Mole",
      "Separation Techniques",
    ],
  },
  {
    id: "physics",
    nameEn: "Physics",
    nameAm: "ፊዚክስ",
    icon: "⚡",
    color: "#6A1B9A",
    bgClass: "subject-physics",
    gradient: "from-purple-800 to-violet-700",
    description: "Mechanics, Electricity, Waves, Optics and Modern Physics",
    topics: [
      "Newton's Laws",
      "Work and Energy",
      "Electricity",
      "Magnetism",
      "Waves",
      "Light and Optics",
      "Thermodynamics",
      "Nuclear Physics",
      "Gravity",
      "Modern Physics",
    ],
  },
  {
    id: "civics",
    nameEn: "Civics & Ethics",
    nameAm: "ሲቪክስ",
    icon: "🏛️",
    color: "#B71C1C",
    bgClass: "subject-civics",
    gradient: "from-red-800 to-red-700",
    description: "Ethiopian Constitution, Democracy, Human Rights and History",
    topics: [
      "Ethiopian Constitution",
      "Government Structure",
      "Democracy",
      "Human Rights",
      "Ethiopian History",
      "International Relations",
      "Federal System",
      "Civil Society",
      "Good Governance",
      "African Union",
    ],
  },
];

export const getSubjectById = (id) => SUBJECTS.find((s) => s.id === id);

export const getSubjectColor = (id) => {
  const subject = getSubjectById(id);
  return subject?.color || "#1B3A6B";
};

export const getSubjectIcon = (id) => {
  const subject = getSubjectById(id);
  return subject?.icon || "📝";
};

export const getSubjectName = (id, lang = "en") => {
  const subject = getSubjectById(id);
  if (!subject) return id;
  return lang === "am" ? subject.nameAm : subject.nameEn;
};

export const getSubjectGradient = (id) => {
  const subject = getSubjectById(id);
  return subject?.gradient || "from-blue-900 to-blue-700";
};

export const SUBJECT_IDS = SUBJECTS.map((s) => s.id);

export const DIFFICULTIES = [
  {
    id: "easy",
    label: "Easy",
    color: "text-green-600 bg-green-100",
    icon: "🟢",
  },
  {
    id: "medium",
    label: "Medium",
    color: "text-yellow-600 bg-yellow-100",
    icon: "🟡",
  },
  { id: "hard", label: "Hard", color: "text-red-600 bg-red-100", icon: "🔴" },
];

export const getDifficultyById = (id) => DIFFICULTIES.find((d) => d.id === id);

export const GRADES = [
  { id: "Grade 11", label: "Grade 11" },
  { id: "Grade 12", label: "Grade 12" },
];
