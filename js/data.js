const servicesData = [

  {
    id: "plumbing",
    name: "Plumbing",
    icon: "fa-wrench",
    description: "Pipe repair, leak fix, drainage",
    subServices: [
      { id: "leak", name: "Pipe Leakage Repair", price: 200 },
      { id: "tap", name: "Tap Installation", price: 150 },
      { id: "drain", name: "Drain Cleaning", price: 300 },
      { id: "tank", name: "Water Tank Repair", price: 400 },
      { id: "bath", name: "Bathroom Fittings", price: 350 },
      { id: "toilet", name: "Toilet Repair", price: 250 }
    ]
  },

  {
    id: "electrical",
    name: "Electrician",
    icon: "fa-bolt",
    description: "Electrical repair",
    subServices: [
      { id: "fan", name: "Fan Installation", price: 250 },
      { id: "wiring", name: "Wiring Repair", price: 500 },
      { id: "switch", name: "Switchboard Fix", price: 200 },
      { id: "inverter", name: "Inverter Setup", price: 700 },
      { id: "light", name: "Light Installation", price: 150 },
      { id: "short", name: "Short Circuit Repair", price: 600 }
    ]
  },

  {
    id: "cleaning",
    name: "Cleaning",
    icon: "fa-broom",
    description: "Home & deep cleaning",
    subServices: [
      { id: "home", name: "Full House Cleaning", price: 1000 },
      { id: "bathroom", name: "Bathroom Cleaning", price: 300 },
      { id: "kitchen", name: "Kitchen Cleaning", price: 400 },
      { id: "sofa", name: "Sofa Cleaning", price: 500 },
      { id: "carpet", name: "Carpet Cleaning", price: 450 },
      { id: "office", name: "Office Cleaning", price: 1200 }
    ]
  },

  {
    id: "appliance",
    name: "Appliance Repair",
    icon: "fa-screwdriver-wrench",
    description: "AC, fridge, washing machine",
    subServices: [
      { id: "ac", name: "AC Repair", price: 800 },
      { id: "fridge", name: "Fridge Repair", price: 700 },
      { id: "washing", name: "Washing Machine Repair", price: 600 },
      { id: "tv", name: "TV Repair", price: 500 },
      { id: "microwave", name: "Microwave Repair", price: 400 },
      { id: "geyser", name: "Geyser Repair", price: 450 }
    ]
  },

  {
    id: "carpentry",
    name: "Carpentry",
    icon: "fa-hammer",
    description: "Furniture repair & woodwork",
    subServices: [
      { id: "furniture", name: "Furniture Repair", price: 600 },
      { id: "door", name: "Door Installation", price: 700 },
      { id: "window", name: "Window Repair", price: 500 },
      { id: "cabinet", name: "Cabinet Making", price: 1200 },
      { id: "polish", name: "Wood Polishing", price: 800 }
    ]
  },

  {
    id: "painting",
    name: "Painting",
    icon: "fa-brush",
    description: "Wall painting & decoration",
    subServices: [
      { id: "interior", name: "Interior Painting", price: 2000 },
      { id: "exterior", name: "Exterior Painting", price: 3000 },
      { id: "putty", name: "Wall Putty", price: 1500 },
      { id: "texture", name: "Texture Painting", price: 2500 },
      { id: "waterproof", name: "Waterproofing", price: 1800 }
    ]
  },

  {
    id: "vehicle",
    name: "Vehicle Services",
    icon: "fa-car",
    description: "Car & bike repair services",
    subServices: [
      { id: "car", name: "Car Repair", price: 1000 },
      { id: "bike", name: "Bike Repair", price: 500 },
      { id: "wash", name: "Car Wash", price: 300 },
      { id: "oil", name: "Oil Change", price: 400 },
      { id: "breakdown", name: "Emergency Breakdown", price: 1200 }
    ]
  },

  {
    id: "beauty",
    name: "Beauty & Salon",
    icon: "fa-scissors",
    description: "Salon services at home",
    subServices: [
      { id: "haircut", name: "Haircut", price: 200 },
      { id: "facial", name: "Facial", price: 600 },
      { id: "makeup", name: "Makeup", price: 1500 },
      { id: "manicure", name: "Manicure & Pedicure", price: 800 },
      { id: "spa", name: "Spa Services", price: 1200 }
    ]
  },

  {
    id: "moving",
    name: "Packers & Movers",
    icon: "fa-box",
    description: "Relocation & transport",
    subServices: [
      { id: "house", name: "House Shifting", price: 5000 },
      { id: "office", name: "Office Relocation", price: 8000 },
      { id: "packing", name: "Packing Services", price: 2000 },
      { id: "loading", name: "Loading & Unloading", price: 1500 },
      { id: "transport", name: "Transport Services", price: 3000 }
    ]
  },

  {
    id: "security",
    name: "Security & CCTV",
    icon: "fa-video",
    description: "Home security setup",
    subServices: [
      { id: "cctv", name: "CCTV Installation", price: 2000 },
      { id: "camera", name: "Camera Repair", price: 800 },
      { id: "lock", name: "Door Lock Installation", price: 500 },
      { id: "system", name: "Security System Setup", price: 3000 }
    ]
  },

  {
    id: "pest",
    name: "Pest Control",
    icon: "fa-bug",
    description: "Remove insects & pests",
    subServices: [
      { id: "termite", name: "Termite Control", price: 1500 },
      { id: "cockroach", name: "Cockroach Control", price: 800 },
      { id: "mosquito", name: "Mosquito Control", price: 700 },
      { id: "rodent", name: "Rodent Control", price: 1000 },
      { id: "bedbug", name: "Bed Bug Treatment", price: 1200 }
    ]
  },

  {
    id: "gardening",
    name: "Gardening",
    icon: "fa-leaf",
    description: "Garden maintenance services",
    subServices: [
      { id: "lawn", name: "Lawn Cutting", price: 500 },
      { id: "plant", name: "Plantation", price: 300 },
      { id: "clean", name: "Garden Cleaning", price: 400 },
      { id: "tree", name: "Tree Trimming", price: 700 }
    ]
  },

  {
    id: "water",
    name: "Water Services",
    icon: "fa-faucet",
    description: "Water tank & pipeline services",
    subServices: [
      { id: "tank", name: "Water Tank Cleaning", price: 800 },
      { id: "pipe", name: "Pipeline Repair", price: 600 },
      { id: "motor", name: "Motor Installation", price: 1000 },
      { id: "borewell", name: "Borewell Maintenance", price: 1500 }
    ]
  },

  {
    id: "emergency",
    name: "Emergency Services",
    icon: "fa-bolt",
    description: "Urgent repair services",
    subServices: [
      { id: "eplumbing", name: "Emergency Plumbing", price: 1000 },
      { id: "eelectrical", name: "Electrical Fault Repair", price: 1200 },
      { id: "eac", name: "Urgent AC Repair", price: 1500 },
      { id: "etech", name: "Immediate Technician Help", price: 800 }
    ]
  }

];