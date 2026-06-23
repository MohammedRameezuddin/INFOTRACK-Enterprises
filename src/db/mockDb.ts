export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  rating: number;
  specs: Record<string, string>;
  embedding: number[]; // 5-dimensional representation: [Performance, Security, Storage/Capacity, Enterprise-Value, Portability]
  images: string[];
  created_at: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  priceEstimate: string;
  category: string;
  features: string[];
  imageUrl: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalPrice: number;
  paymentStatus: 'Pending' | 'Paid' | 'Refunded';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: string;
  paymentId?: string;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  mediaType: 'image' | 'video';
  status: 'draft' | 'published' | 'expired';
  createdBy: string;
  createdAt: string;
  expiresAt: string | null; // null = permanent
  ctaText: string;
  ctaUrl: string;
  viewCount: number;
  category: 'offer' | 'product' | 'announcement' | 'news' | 'promotion';
}

export interface StoryView {
  id: string;
  storyId: string;
  sessionId: string;
  viewedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceTitle: string;
  status: 'Pending' | 'Assigned' | 'Completed' | 'Cancelled';
  message: string;
  preferredDate: string;
  assignedEngineer?: string;
  createdAt: string;
}

// Initial Seed Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Dell Latitude 7440 Ultralight',
    description: '14" premium enterprise laptop powered by Intel Core i7, offering high-end portability, security, and performance for modern corporate professionals.',
    price: 98500,
    stock: 24,
    category: 'Laptops',
    brand: 'Dell',
    rating: 4.8,
    specs: {
      Processor: 'Intel Core i7-1365U vPro (10 Cores, up to 5.2GHz)',
      RAM: '16GB LPDDR5 4800MHz',
      Storage: '512GB NVMe PCIe Gen4 SSD',
      Display: '14.0" FHD+ (1920x1200) Anti-Glare, ComfortView+',
      OS: 'Windows 11 Pro Enterprise',
      Battery: '57Whr with ExpressCharge',
      Weight: '1.05 kg',
      Security: 'TPM 2.0, Fingerprint Reader, IR Camera (Windows Hello)'
    },
    // Embedding: [Performance, Security, Storage, Enterprise-Value, Portability]
    embedding: [0.8, 0.9, 0.6, 0.8, 0.95],
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop'],
    created_at: '2026-01-10T12:00:00Z'
  },
  {
    id: 'prod-2',
    title: 'Lenovo ThinkPad X1 Carbon Gen 11',
    description: 'The legendary business notebook. Renowned tactile keyboard, carbon fiber weave, military-grade durability, and robust enterprise firmware security.',
    price: 135000,
    stock: 15,
    category: 'Laptops',
    brand: 'Lenovo',
    rating: 4.9,
    specs: {
      Processor: 'Intel Core i7-1355U vPro (10 Cores)',
      RAM: '32GB LPDDR5 6400MHz',
      Storage: '1TB PCIe NVMe SSD',
      Display: '14.0" WUXGA IPS Touchscreen (400 nits)',
      OS: 'Windows 11 Pro Enterprise',
      Battery: '57Whr with Rapid Charge',
      Weight: '1.12 kg',
      Security: 'dTPM 2.0, Webcam Privacy Shutter, ThinkShield Security Suite'
    },
    embedding: [0.85, 0.95, 0.8, 0.9, 0.9],
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop'],
    created_at: '2026-02-15T10:00:00Z'
  },
  {
    id: 'prod-3',
    title: 'HP EliteBook 840 G10',
    description: 'Premium aluminum business laptop optimized for collaboration. Audio by Bang & Olufsen and HP Wolf Pro Security suite.',
    price: 89000,
    stock: 18,
    category: 'Laptops',
    brand: 'HP',
    rating: 4.6,
    specs: {
      Processor: 'Intel Core i5-1340P (12 Cores, up to 4.6GHz)',
      RAM: '16GB DDR5 5200MHz',
      Storage: '512GB Gen4 SSD',
      Display: '14" WUXGA Anti-Glare IPS',
      OS: 'Windows 11 Pro',
      Battery: '51Whr with Rapid Charge',
      Weight: '1.36 kg',
      Security: 'HP Sure Start, TPM 2.0, Privacy Screen Option'
    },
    embedding: [0.75, 0.85, 0.6, 0.75, 0.8],
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop'],
    created_at: '2026-03-01T09:00:00Z'
  },
  {
    id: 'prod-4',
    title: 'Dell PowerEdge R760 Rack Server',
    description: 'High-density 2U enterprise rack server. Engineered for demanding workloads, virtualization, AI database modeling, and scalable cloud infrastructures.',
    price: 495000,
    stock: 4,
    category: 'Servers',
    brand: 'Dell',
    rating: 5.0,
    specs: {
      Processor: 'Dual 4th Gen Intel Xeon Scalable 4410Y (24 Cores total)',
      RAM: '128GB ECC DDR5 RDIMM (Expandable to 8TB)',
      Storage: '4x 1.92TB SATA Enterprise SSD + 12 Drive Bays Open',
      RAID: 'PERC H755 Adapter (RAID 0, 1, 5, 10)',
      PowerSupply: 'Dual, Hot-Plug Redundant 1400W Power Supplies',
      Management: 'iDRAC9 Enterprise Remote Controller',
      Weight: '28.6 kg',
      Warranty: '3-Year ProSupport Plus Next Business Day Onsite'
    },
    embedding: [0.99, 0.95, 0.99, 0.95, 0.1], // Super high performance, storage, enterprise-value, zero portability
    images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop'],
    created_at: '2026-01-20T14:30:00Z'
  },
  {
    id: 'prod-5',
    title: 'HPE ProLiant DL380 Gen11',
    description: 'The industry-standard multi-workload enterprise server. Highly adaptable, optimized for machine learning pipelines, storage analytics, and high availability.',
    price: 460000,
    stock: 6,
    category: 'Servers',
    brand: 'HP',
    rating: 4.8,
    specs: {
      Processor: 'Intel Xeon Scalable Gold 5415+ (8 Cores, 2.9GHz)',
      RAM: '64GB RDIMM Dual Rank',
      Storage: '2x 960GB NVMe SSD (Read Intensive)',
      RAID: 'HPE Smart Array SR932i-p Controller',
      PowerSupply: 'Dual 800W Flex Slot Platinum Hot-Plug',
      Management: 'HPE iLO 6 Advanced with security silicon root of trust',
      Weight: '26.0 kg',
      FormFactor: '2U Rackmount'
    },
    embedding: [0.95, 0.98, 0.9, 0.95, 0.1],
    images: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop'],
    created_at: '2026-02-22T08:15:00Z'
  },
  {
    id: 'prod-6',
    title: 'Hikvision 8MP 4K AccuSense Dome Camera',
    description: 'Professional high-definition security camera featuring AI human and vehicle classification, infrared night vision up to 40m, and IP67 weather protection.',
    price: 7800,
    stock: 80,
    category: 'CCTV & Security',
    brand: 'Hikvision',
    rating: 4.7,
    specs: {
      Resolution: '8 Megapixel (3840 x 2160) @ 20fps',
      Lens: '2.8mm fixed lens (107° horizontal FOV)',
      NightVision: 'IR Range up to 40 meters, Smart IR',
      AIAnalytics: 'Deep learning-based human and vehicle target detection',
      Weatherproof: 'IP67 water/dust protection, IK10 vandal-proof rating',
      Storage: 'Built-in MicroSD slot (up to 256GB), NVR compatible',
      Power: 'PoE (Power over Ethernet) or 12V DC'
    },
    embedding: [0.4, 0.9, 0.3, 0.7, 0.5],
    images: ['https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop'],
    created_at: '2026-03-10T11:45:00Z'
  },
  {
    id: 'prod-7',
    title: 'CP Plus 4MP Smart IP Bullet Camera',
    description: 'Outdoor surveillance camera with full-color night vision, built-in active deterrence light & siren, and two-way audio for active site protection.',
    price: 4900,
    stock: 120,
    category: 'CCTV & Security',
    brand: 'CP Plus',
    rating: 4.5,
    specs: {
      Resolution: '4 Megapixel (2560 x 1440) @ 25fps',
      FullColor: 'Starlight night vision (24/7 color mode with LED fill lights)',
      Audio: 'Built-in microphone and speaker (Two-way intercom)',
      Deterrence: 'Strobe light alarm & customized siren triggers',
      Protection: 'IP67 Weatherproof rating, Surge Protection',
      Power: 'PoE or 12V DC Adapter'
    },
    embedding: [0.3, 0.85, 0.2, 0.6, 0.4],
    images: ['https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&auto=format&fit=crop'],
    created_at: '2026-03-25T16:20:00Z'
  },
  {
    id: 'prod-8',
    title: 'Cisco Catalyst 9300 24-Port Switch',
    description: 'Enterprise-class stackable switch designed for high-density corporate networking, support for full PoE+ allocation, and advanced hardware security.',
    price: 185000,
    stock: 8,
    category: 'Networking',
    brand: 'Cisco',
    rating: 4.9,
    specs: {
      Ports: '24x 10/100/1000 Ethernet Ports with PoE+ support',
      PoEBudget: '740W total PoE allocation',
      Stacking: 'StackWise-480 architecture support (up to 480 Gbps)',
      Uplinks: 'Modular uplinks (1G/10G/25G/40G options)',
      OS: 'Cisco IOS XE operating system',
      Security: 'MACsec-256 encryption, Trustworthy Solutions',
      Management: 'Cisco DNA Center, Command Line Interface (CLI)'
    },
    embedding: [0.9, 0.95, 0.8, 0.9, 0.2],
    images: ['https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600&auto=format&fit=crop'],
    created_at: '2026-02-10T15:00:00Z'
  },
  {
    id: 'prod-9',
    title: 'Ubiquiti UniFi Dream Machine Special Edition',
    description: 'All-in-one console combining security gateway router, network video recorder, 10G SFP+ uplink, PoE switch, and centralized UniFi application software.',
    price: 64000,
    stock: 12,
    category: 'Networking',
    brand: 'Ubiquiti',
    rating: 4.8,
    specs: {
      WANPorts: '1x 10G SFP+ port, 1x 2.5GbE RJ45 port',
      LANPorts: '8x RJ45 ports (6x PoE, 2x PoE+), 1x 10G SFP+ port',
      Throughput: 'IDS/IPS throughput up to 3.5 Gbps',
      Storage: 'Built-in 128GB SSD + 3.5" HDD bay for NVR surveillance',
      Management: 'Integrated UniFi Network Controller, App access',
      Screen: '1.3" LCM touchscreen for real-time status diagnostics'
    },
    embedding: [0.8, 0.9, 0.7, 0.85, 0.4],
    images: ['https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&auto=format&fit=crop'],
    created_at: '2026-03-12T13:40:00Z'
  },
  {
    id: 'prod-10',
    title: 'Dell OptiPlex 7010 Tower Desktop',
    description: 'High-reliability enterprise desktop computer. Engineered for high performance, business scalability, and standard office workloads.',
    price: 49500,
    stock: 20,
    category: 'Desktops',
    brand: 'Dell',
    rating: 4.7,
    specs: {
      Processor: 'Intel Core i5-13500 (14 Cores, up to 4.8GHz)',
      RAM: '8GB DDR5 Non-ECC Memory',
      Storage: '256GB NVMe M.2 SSD',
      Graphics: 'Intel UHD Graphics 770',
      OS: 'Windows 11 Pro',
      FormFactor: 'Tower (OptiPlex 7010)',
      Warranty: '3-Year Onsite Service'
    },
    embedding: [0.7, 0.8, 0.5, 0.85, 0.2],
    images: ['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&auto=format&fit=crop'],
    created_at: '2026-04-01T10:00:00Z'
  },
  {
    id: 'prod-11',
    title: 'HP LaserJet Pro MFP M428fdw',
    description: 'Wireless monochrome laser printer, scanner, copier, and fax. High print speeds, robust cybersecurity safeguards, and auto duplexing.',
    price: 36500,
    stock: 10,
    category: 'Printers',
    brand: 'HP',
    rating: 4.6,
    specs: {
      PrintSpeed: 'Up to 40 ppm (black)',
      Functions: 'Print, Scan, Copy, Fax, Email',
      Cabling: 'USB, Gigabit Ethernet, Wi-Fi 802.11b/g/n',
      DutyCycle: 'Up to 80,000 pages monthly',
      Resolution: '1200 x 1200 dpi',
      PaperHandling: '100-sheet multipurpose tray, 250-sheet input tray'
    },
    embedding: [0.5, 0.7, 0.3, 0.9, 0.3],
    images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop'],
    created_at: '2026-04-05T11:00:00Z'
  },
  {
    id: 'prod-12',
    title: 'Sophos XGS 116 Security Gateway',
    description: 'Next-Gen corporate hardware firewall with built-in TLS inspection, threat protection, and zero-day threat analysis to secure branch networks.',
    price: 72000,
    stock: 6,
    category: 'Networking',
    brand: 'Sophos',
    rating: 4.8,
    specs: {
      FirewallThroughput: '7,700 Mbps',
      IPsecVPNThroughput: '900 Mbps',
      ThreatProtection: '330 Mbps',
      Ports: '4x GbE copper, 4x GbE SFP, 1x SFP+',
      UsersRecommended: 'Up to 15 users'
    },
    embedding: [0.75, 0.99, 0.4, 0.9, 0.3],
    images: ['https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600&auto=format&fit=crop'],
    created_at: '2026-04-10T14:00:00Z'
  },
  {
    id: 'prod-13',
    title: 'Microsoft 365 Business Premium',
    description: '1-Year digital software license. Teams collaboration, secure cloud storage, and advanced cybersecurity threat protection.',
    price: 18500,
    stock: 50,
    category: 'Software Licences',
    brand: 'Microsoft',
    rating: 4.9,
    specs: {
      Duration: '1 Year Subscription',
      DevicesPerUser: 'Up to 5 phones, 5 tablets, and 5 PCs/Macs per user',
      AppsIncluded: 'Word, Excel, PowerPoint, Outlook, Teams, OneDrive (1TB), Access',
      SecurityFeatures: 'Defends against malware, phishing, and ransomware. Secure remote work deployment'
    },
    embedding: [0.8, 0.95, 0.9, 0.95, 0.99],
    images: ['https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop'],
    created_at: '2026-04-12T09:00:00Z'
  }
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'serv-1',
    title: 'Annual Maintenance Contract (AMC)',
    description: 'Comprehensive IT infrastructure coverage. Includes routine system checkups, hardware servicing, software health optimization, virus mitigation, and prioritized emergency on-site engineer deployment.',
    priceEstimate: 'Starting at ₹18,000 / year',
    category: 'AMC',
    features: [
      'Routine monthly system audits & health reports',
      'Unlimited emergency breakdown call support',
      'Free replacement for parts covered in warranty',
      'Quarterly physical cleaning of servers & workstations',
      'Enterprise antivirus and system patching configuration',
      'Backup verification and disaster recovery audits'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop'
  },
  {
    id: 'serv-2',
    title: 'CCTV Surveillance Setup & Management',
    description: 'Design, wiring, camera positioning, NVR configuration, and cloud-access setup. We implement high-definition IP camera networks with intelligent tracking, alerting, and remote mobile viewing.',
    priceEstimate: 'Custom quote (₹1,200 base installation per camera)',
    category: 'Installation',
    features: [
      'Site map survey and camera positioning consultation',
      'Cat6 structure cabling with conduits and weatherproofing',
      'NVR storage calculation & backup configurations',
      'Mobile app remote monitoring & alert setup',
      'AI event notification calibration (Human/Vehicle triggers)',
      '1-year post-installation onsite testing warranty'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop'
  },
  {
    id: 'serv-3',
    title: 'Network Design & Maintenance',
    description: 'Scaling network architectures for enterprise offices. Structured cabling, fiber termination, core switch configurations, firewall setups (Sophos/Fortinet), and high-availability dual-WAN design.',
    priceEstimate: 'Starting at ₹8,500 base consultation',
    category: 'Consultation',
    features: [
      'Visual cabling cleanup & rack reorganization plans',
      'VLAN and subnet design for traffic isolation',
      'Wi-Fi coverage maps & heatmaps (Ubiquiti/Aruba)',
      'Firewall policies, intrusion prevention, & content filtering',
      'Failover multi-WAN network configuration',
      'Detailed network topography report & documentation'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600&auto=format&fit=crop'
  },
  {
    id: 'serv-4',
    title: 'On-Site IT Support & OS Maintenance',
    description: 'On-demand technical assistance for workstations, printer setups, email configurations, and local networks. Handheld onsite help for Windows, Mac, Linux, and Google Systems.',
    priceEstimate: 'Starting at ₹950 / incident',
    category: 'Support',
    features: [
      'On-site contact IT support & diagnostics',
      'Virus / Malware Eradication & Protection configuration',
      'Windows, Mac, Linux & Google Systems troubleshooting',
      'Network printer & shared storage access setup',
      'Employee onboarding / offboarding workstation provisioning',
      'Active directory password resets & login assistance'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop'
  },
  {
    id: 'serv-5',
    title: 'Cloud Backup & Disaster Recovery',
    description: 'Complete data backup planning and recovery services. We design redundant local NAS arrays combined with automated offsite cloud backups to protect your business databases.',
    priceEstimate: 'Custom quote based on storage size',
    category: 'Support',
    features: [
      'Managed local and cloud backup orchestration',
      'Encrypted offsite database replication schedules',
      'Data recovery from failed storage media or partition losses',
      'Periodic restoration dry-runs and validation audits',
      'Google Workspace and Office 365 backup compliance archives'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop'
  },
  {
    id: 'serv-6',
    title: 'Website Design, Hosting & Cloud Services',
    description: 'Custom web development, domain configuration, business emails setup, and managed cloud VM hosting. Build highly polished React/Vite interfaces with optimized speeds.',
    priceEstimate: 'Starting at ₹12,000 / project',
    category: 'Installation',
    features: [
      'Modern, mobile-responsive React web design & development',
      'Secure VPS / cloud instance configurations (AWS, DigitalOcean)',
      'Professional business email hosting & SPF/DKIM validation',
      'Free SSL certificates installation and auto-renewal setups',
      '24/7 server uptime monitoring and daily code backups'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop'
  },
  {
    id: 'serv-7',
    title: 'Corporate IT Staffing Services',
    description: 'Outsource your technical operations. We supply experienced IT helpdesk agents, certified network administrators, and system security engineers on flexible temporary or permanent contracts.',
    priceEstimate: 'Custom monthly staffing plans',
    category: 'Support',
    features: [
      'Dedicated on-site support engineers reporting daily',
      'Certified professionals (CCNA, MCSE, ITIL, Sophos Security)',
      'Flexible replacement policies to maintain workplace uptime',
      'Direct ticket-escalation support to Infotrack operations core'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1521791136364-7286d35243dd?w=600&auto=format&fit=crop'
  }
];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_SERVICE_REQUESTS: ServiceRequest[] = [];

const INITIAL_REVIEWS: Review[] = [];

// Helper: generate a future ISO date
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

const INITIAL_STORIES: Story[] = [];

export class MockDb {
  private getStorageItem<T>(key: string, initial: T): T {
    const data = localStorage.getItem(`infotrack_${key}`);
    if (!data) {
      localStorage.setItem(`infotrack_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private setStorageItem<T>(key: string, data: T): void {
    localStorage.setItem(`infotrack_${key}`, JSON.stringify(data));
  }

  // Auth Simulation
  getCurrentUser(): User {
    const defaultUser: User = {
      id: 'user-cust',
      name: 'Jane Smith',
      email: 'jane@enterprise.com',
      phone: '+91 98765 43210',
      role: 'customer',
      created_at: '2026-01-01T00:00:00Z'
    };
    return this.getStorageItem<User>('current_user', defaultUser);
  }

  setCurrentUser(user: User): void {
    this.setStorageItem<User>('current_user', user);
  }

  logout(): void {
    localStorage.removeItem('infotrack_current_user');
  }

  resetDatabase(): void {
    // Note: This is a destructive operation.
    // It clears all infotrack-related data from localStorage.
    Object.keys(localStorage)
      .filter(key => key.startsWith('infotrack_'))
      .forEach(key => localStorage.removeItem(key));
  }

  authenticateAdmin(email: string, password: string): User | null {
    if (email === 'admin@infotrack.in' && password === 'InfotrackAdmin2026!') {
      const adminUser: User = {
        id: 'user-admin',
        name: 'Infotrack Admin Solutions',
        email: 'admin@infotrack.in',
        phone: '+91 40 4821 9900',
        role: 'admin',
        created_at: '2026-01-01T00:00:00Z',
      };
      this.setCurrentUser(adminUser);
      return adminUser;
    }
    return null;
  }

  // Products
  getProducts(): Product[] {
    return this.getStorageItem<Product[]>('products', INITIAL_PRODUCTS);
  }

  // Try fetching products from backend API if available; fall back to local storage data
  async fetchProducts(): Promise<Product[]> {
    try {
      const resp = await fetch('http://localhost:3000/products');
      if (!resp.ok) throw new Error('Network response not ok');
      const data = await resp.json();
      return data;
    } catch (err) {
      return this.getProducts();
    }
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.push(product);
    }
    this.setStorageItem<Product[]>('products', products);
  }

  deleteProduct(id: string): void {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.setStorageItem<Product[]>('products', filtered);
  }

  // Services
  getServices(): Service[] {
    return this.getStorageItem<Service[]>('services', INITIAL_SERVICES);
  }

  async fetchServices(): Promise<Service[]> {
    try {
      const resp = await fetch('http://localhost:3000/services');
      if (!resp.ok) throw new Error('Network response not ok');
      const data = await resp.json();
      return data;
    } catch (err) {
      return this.getServices();
    }
  }

  // Orders
  getOrders(): Order[] {
    return INITIAL_ORDERS;
  }

  createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const orders = this.getOrders();
    const newOrder: Order = {
      ...order,
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    this.setStorageItem<Order[]>('orders', orders);

    // Deduct stock for products
    const products = this.getProducts();
    newOrder.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        this.saveProduct(prod);
      }
    });

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.orderStatus = status;
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }
      this.setStorageItem<Order[]>('orders', orders);
      return order;
    }
    return null;
  }

  // Service Requests
  getServiceRequests(): ServiceRequest[] {
    return this.getStorageItem<ServiceRequest[]>('service_requests', INITIAL_SERVICE_REQUESTS);
  }

  createServiceRequest(request: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>): ServiceRequest {
    const requests = this.getServiceRequests();
    const newRequest: ServiceRequest = {
      ...request,
      id: `req-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    requests.unshift(newRequest);
    this.setStorageItem<ServiceRequest[]>('service_requests', requests);
    return newRequest;
  }

  updateServiceRequestStatus(id: string, status: ServiceRequest['status'], engineer?: string): ServiceRequest | null {
    const requests = this.getServiceRequests();
    const req = requests.find(r => r.id === id);
    if (req) {
      req.status = status;
      if (engineer) {
        req.assignedEngineer = engineer;
      }
      this.setStorageItem<ServiceRequest[]>('service_requests', requests);
      return req;
    }
    return null;
  }

  // Reviews
  getReviews(productId?: string): Review[] {
    const reviews = this.getStorageItem<Review[]>('reviews', INITIAL_REVIEWS);
    if (productId) {
      return reviews.filter(r => r.productId === productId);
    }
    return reviews;
  }

  addReview(productId: string, userName: string, rating: number, comment: string): Review {
    const reviews = this.getStorageItem<Review[]>('reviews', INITIAL_REVIEWS);
    const newReview: Review = {
      id: `rev-${Math.floor(10000 + Math.random() * 90000)}`,
      productId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newReview);
    this.setStorageItem<Review[]>('reviews', reviews);

    // Update Product average rating
    const products = this.getProducts();
    const product = products.find(p => p.id === productId);
    if (product) {
      const prodReviews = reviews.filter(r => r.productId === productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      product.rating = parseFloat(avg.toFixed(1));
      this.saveProduct(product);
    }

    return newReview;
  }

  deleteReview(id: string): void {
    const reviews = this.getStorageItem<Review[]>('reviews', INITIAL_REVIEWS);
    const filtered = reviews.filter(r => r.id !== id);
    this.setStorageItem<Review[]>('reviews', filtered);
  }

  // System Settings
  getIntroVideoUrl(): string {
    const storedIntroVideoUrl = this.getStorageItem<string | null>('intro_video_url', null);
    const legacyBlockedIntroVideoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-background-with-lines-and-dots-42526-large.mp4';

    if (storedIntroVideoUrl && storedIntroVideoUrl !== legacyBlockedIntroVideoUrl) {
      return storedIntroVideoUrl;
    }

    return '/intro-video.mp4';
  }

  setIntroVideoUrl(url: string): void {
    this.setStorageItem<string>('intro_video_url', url);
  }

  getSupportPhone(): string {
    return this.getStorageItem<string>('support_phone', '919966600646');
  }

  setSupportPhone(phone: string): void {
    this.setStorageItem<string>('support_phone', phone);
  }

  getAlternatePhone(): string {
    return this.getStorageItem<string>('alternate_phone', '919908243746');
  }

  setAlternatePhone(phone: string): void {
    this.setStorageItem<string>('alternate_phone', phone);
  }

  getSupportEmail(): string {
    return this.getStorageItem<string>('support_email', 'infotrackenterprises@gmail.com');
  }

  setSupportEmail(email: string): void {
    this.setStorageItem<string>('support_email', email);
  }

  getSupportAddress(): string {
    return this.getStorageItem<string>('support_address', 'Old Vt Colony Near Katatiya Degree College Nalgonda Telangana - 508001');
  }

  setSupportAddress(address: string): void {
    this.setStorageItem<string>('support_address', address);
  }

  getDirectorName(): string {
    return this.getStorageItem<string>('director_name', 'Mohd Irfan Uddin');
  }

  setDirectorName(name: string): void {
    this.setStorageItem<string>('director_name', name);
  }

  // Stories
  getStories(): Story[] {
    return this.getStorageItem<Story[]>('stories', INITIAL_STORIES);
  }

  // Only return published, non-expired stories
  getActiveStories(): Story[] {
    const stories = this.getStories();
    const now = new Date().toISOString();
    return stories.filter(s => {
      if (s.status !== 'published') return false;
      if (s.expiresAt && s.expiresAt < now) return false;
      return true;
    });
  }

  createStory(story: Omit<Story, 'id' | 'createdAt' | 'viewCount'>): Story {
    const stories = this.getStories();
    const newStory: Story = {
      ...story,
      id: `story-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      viewCount: 0
    };
    stories.unshift(newStory);
    this.setStorageItem<Story[]>('stories', stories);
    return newStory;
  }

  updateStory(id: string, updates: Partial<Story>): Story | null {
    const stories = this.getStories();
    const story = stories.find(s => s.id === id);
    if (story) {
      Object.assign(story, updates);
      this.setStorageItem<Story[]>('stories', stories);
      return story;
    }
    return null;
  }

  deleteStory(id: string): void {
    const stories = this.getStories();
    this.setStorageItem<Story[]>('stories', stories.filter(s => s.id !== id));
  }

  incrementStoryView(storyId: string): void {
    const stories = this.getStories();
    const story = stories.find(s => s.id === storyId);
    if (story) {
      story.viewCount += 1;
      this.setStorageItem<Story[]>('stories', stories);

      // Also log view
      const views = this.getStoryViews(storyId);
      const sessionId = sessionStorage.getItem('infotrack_session') || (() => {
        const sid = `sess-${Math.random().toString(36).slice(2, 10)}`;
        sessionStorage.setItem('infotrack_session', sid);
        return sid;
      })();
      views.push({
        id: `view-${Math.floor(100000 + Math.random() * 900000)}`,
        storyId,
        sessionId,
        viewedAt: new Date().toISOString()
      });
      this.setStorageItem<StoryView[]>('story_views', views);
    }
  }

  getStoryViews(storyId?: string): StoryView[] {
    const views = this.getStorageItem<StoryView[]>('story_views', []);
    if (storyId) return views.filter(v => v.storyId === storyId);
    return views;
  }

  // Auto-expire stories past their expiry date
  expireOldStories(): number {
    const stories = this.getStories();
    const now = new Date().toISOString();
    let expired = 0;
    stories.forEach(s => {
      if (s.status === 'published' && s.expiresAt && s.expiresAt < now) {
        s.status = 'expired';
        expired++;
      }
    });
    if (expired > 0) {
      this.setStorageItem<Story[]>('stories', stories);
    }
    return expired;
  }
}

export const db = new MockDb();
