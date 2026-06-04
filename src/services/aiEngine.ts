import { db } from '../db/mockDb';
import type { Product } from '../db/mockDb';

// Utility: Vector Math
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

// Convert user search text to a mock 5D embedding vector:
// [Performance, Security, Storage, Enterprise-Value, Portability]
export function queryToEmbedding(query: string): number[] {
  const q = query.toLowerCase();
  let vec = [0.5, 0.5, 0.5, 0.5, 0.5]; // Neutral base vector

  if (q.includes('performance') || q.includes('fast') || q.includes('programming') || q.includes('developer') || q.includes('power') || q.includes('heavy') || q.includes('server') || q.includes('xeon') || q.includes('i7')) {
    vec[0] += 0.4;
  }
  if (q.includes('secure') || q.includes('security') || q.includes('cctv') || q.includes('camera') || q.includes('encryption') || q.includes('vpro') || q.includes('firewall') || q.includes('protect')) {
    vec[1] += 0.45;
  }
  if (q.includes('storage') || q.includes('space') || q.includes('capacity') || q.includes('hard disk') || q.includes('ssd') || q.includes('tb') || q.includes('nvr')) {
    vec[2] += 0.4;
  }
  if (q.includes('value') || q.includes('budget') || q.includes('cheap') || q.includes('under') || q.includes('pricing') || q.includes('cost') || q.includes('affordable') || q.includes('low price')) {
    vec[3] += 0.4;
  }
  if (q.includes('light') || q.includes('portable') || q.includes('travel') || q.includes('weight') || q.includes('laptop') || q.includes('ultralight')) {
    vec[4] += 0.4;
  }

  // Cap values at 1.0 and normalize
  return vec.map(v => Math.min(1.0, Math.max(0.0, v)));
}

export interface RecommendationResult {
  product: Product;
  score: number;
  explanation: string;
}

export class AiEngine {
  // 1. Semantic Product Search (simulating pgvector vector search)
  semanticSearch(query: string, limit = 4): RecommendationResult[] {
    const products = db.getProducts();
    const queryVec = queryToEmbedding(query);

    const scored = products.map(prod => {
      const score = cosineSimilarity(queryVec, prod.embedding);
      
      // Generate dynamically tailored explanation based on product strength and query intent
      let explanation = `Matched based on hardware profiles.`;
      const q = query.toLowerCase();
      
      if (prod.category === 'Laptops') {
        if (q.includes('portable') || q.includes('light') || q.includes('travel')) {
          explanation = `Highly recommended because this laptop weighs only ${prod.specs.Weight || '1.1kg'} and offers excellent on-the-go productivity.`;
        } else if (q.includes('secure') || q.includes('business')) {
          explanation = `Matches your security request with vPro hardware protection, TPM 2.0, and the ${prod.specs.Security?.split(',')[0] || 'advanced security suite'}.`;
        } else if (q.includes('programming') || q.includes('performance')) {
          explanation = `Selected for coding/development workloads due to its powerful ${prod.specs.Processor} and ${prod.specs.RAM} memory setup.`;
        } else {
          explanation = `Fits business standards with an ${prod.specs.Processor} processor and solid ${prod.specs.Storage} storage.`;
        }
      } else if (prod.category === 'Servers') {
        explanation = `Matches enterprise datacenter requirements. Equipped with ${prod.specs.Processor} and hot-plug redundant power supplies for high availability.`;
      } else if (prod.category === 'CCTV & Security') {
        explanation = `Fits surveillance specifications. Offers high-resolution ${prod.specs.Resolution} and advanced ${prod.specs.AIAnalytics || 'motion detection'}.`;
      } else if (prod.category === 'Networking') {
        explanation = `Fits network infrastructure needs, providing robust high-throughput capabilities (${prod.specs.Ports || 'Gigabit Ethernet'}) and secure enterprise administration.`;
      }

      return {
        product: prod,
        score: parseFloat(score.toFixed(3)),
        explanation
      };
    });

    // Sort by cosine similarity score descending
    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // 2. AI Budget & Custom Query Solver
  getRecommendationForPrompt(prompt: string): {
    matchedProducts: RecommendationResult[];
    budgetConstraint?: number;
    detectedCategory?: string;
    explanationText: string;
  } {
    const p = prompt.toLowerCase();
    
    // Attempt to extract numeric budget constraint (e.g. "under 100000", "below ₹50,000", "budget 80k")
    let budgetConstraint: number | undefined = undefined;
    
    // Match "under X" or "below X" or "budget X" or "within X"
    const budgetRegexes = [
      /(?:under|below|budget|within|price|max|maximum)\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i,
      /([\d,]+)\s*(?:rupees|inr|rs|₹)?\s*(?:or less|budget|max)/i
    ];
    
    for (const regex of budgetRegexes) {
      const match = p.match(regex);
      if (match && match[1]) {
        const cleanNum = match[1].replace(/,/g, '');
        const val = parseInt(cleanNum);
        if (!isNaN(val)) {
          budgetConstraint = val;
          break;
        }
      }
    }

    // Direct check for "50k" or "80k" style budget shorthands
    const kRegex = /(?:under|below|max|budget)\s*(\d+)k/i;
    const kMatch = p.match(kRegex);
    if (kMatch && kMatch[1]) {
      budgetConstraint = parseInt(kMatch[1]) * 1000;
    }

    // Determine category intent
    let detectedCategory: string | undefined = undefined;
    if (p.includes('laptop') || p.includes('notebook') || qMatch(p, ['dell', 'thinkpad', 'hp', 'lenovo'])) {
      detectedCategory = 'Laptops';
    } else if (p.includes('server') || p.includes('poweredge') || p.includes('proliant')) {
      detectedCategory = 'Servers';
    } else if (p.includes('cctv') || p.includes('camera') || p.includes('camera') || p.includes('security') || p.includes('surveillance')) {
      detectedCategory = 'CCTV & Security';
    } else if (p.includes('switch') || p.includes('router') || p.includes('network') || p.includes('cisco') || p.includes('unifi')) {
      detectedCategory = 'Networking';
    }

    // Fetch all products, filter by category and budget if detected, then run semantic ranking
    let pool = db.getProducts();
    if (detectedCategory) {
      pool = pool.filter(prod => prod.category === detectedCategory);
    }
    if (budgetConstraint) {
      pool = pool.filter(prod => prod.price <= (budgetConstraint as number));
    }

    // If pool is empty because of strict budget, fall back to global products to show "next best" options
    if (pool.length === 0) {
      pool = db.getProducts();
    }

    const queryVec = queryToEmbedding(prompt);
    const matched = pool.map(prod => {
      const score = cosineSimilarity(queryVec, prod.embedding);
      let explanation = `Ideal specification match.`;
      
      if (budgetConstraint && prod.price <= budgetConstraint) {
        explanation = `Fits perfectly in budget at ₹${prod.price.toLocaleString('en-IN')}, offering great cost-efficiency.`;
      } else if (budgetConstraint && prod.price > budgetConstraint) {
        explanation = `Exceeds the target budget of ₹${budgetConstraint.toLocaleString('en-IN')} slightly, but recommended due to superior hardware longevity.`;
      } else if (prod.specs.Processor && p.includes('coding')) {
        explanation = `Strong compilation speeds via the ${prod.specs.Processor} and high stability.`;
      }

      return {
        product: prod,
        score: parseFloat(score.toFixed(3)),
        explanation
      };
    }).sort((a, b) => b.score - a.score).slice(0, 3);

    // Formulate a response explanation from the "FastAPI AI Engine"
    let explanationText = '';
    if (matched.length > 0) {
      const topP = matched[0].product;
      explanationText = `I have analyzed our inventory for "${prompt}". Based on semantic evaluation, our top recommendation is the **${topP.brand} ${topP.title}**. `;
      if (budgetConstraint) {
        explanationText += `It fits within your budget constraints (₹${budgetConstraint.toLocaleString('en-IN')}) and provides excellent enterprise hardware configurations. `;
      } else {
        explanationText += `It features high-grade engineering including a ${topP.specs.Processor || topP.specs.Resolution || 'premium design'} suitable for professional deployment. `;
      }
      explanationText += `Below are the top recommendations with semantic match details:`;
    } else {
      explanationText = `I couldn't find any products matching your specific query in our current catalog. Please try widening your budget or adjusting your specifications.`;
    }

    return {
      matchedProducts: matched,
      budgetConstraint,
      detectedCategory,
      explanationText
    };
  }

  // 3. Conversational AI Chat Bot state handler
  // Simple rules to make chatbot feel extremely smart & interactive
  handleChatSession(messages: { role: 'user' | 'assistant', content: string }[]): string {
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    // Check for greeting
    if (qMatch(lastMsg, ['hello', 'hi', 'hey', 'greetings', 'morning', 'admin'])) {
      return `Hello! Welcome to the Infotrack Enterprises AI Commerce Portal. 🌐\n\nI am your intelligent assistant linked directly to our FastAPI recommendation engine and PostgreSQL database.\n\nI can help you:\n1. Find products (e.g., **"Find a lightweight office laptop"** or **"Servers under ₹5,00,000"**)\n2. Answer technical questions about our stock\n3. Calculate estimate quotes for IT setups or CCTV installations\n4. Guide you on Annual Maintenance Contracts (AMC).\n\nWhat can I assist your business with today?`;
    }

    // Check for service inquiry
    if (qMatch(lastMsg, ['amc', 'annual maintenance', 'service contract', 'contract'])) {
      return `Infotrack Enterprises provides premier Annual Maintenance Contracts (AMC) across Telangana and Andhra Pradesh.\n\nOur service includes:\n- Monthly preventative maintenance visits\n- Remote and on-site helpdesk support\n- Network administration and cybersecurity health audits\n\nWould you like me to book a consultation? You can use the **Services** page to schedule a site audit, or tell me your requirements and I can draft a request for our sales engineers.`;
    }

    if (qMatch(lastMsg, ['cctv', 'camera', 'surveillance', 'install camera'])) {
      return `We design and install professional enterprise surveillance networks using premium 4K Hikvision dome cameras and CP Plus bullet systems. Features include full-color night vision, audio deterrence, and smart AI object tracking.\n\nYou can browse our cameras in the **Store** under "CCTV & Security", or schedule an installation team in the **Services** booking section. Let me know if you want product comparisons!`;
    }

    // Recommendation logic
    const rec = this.getRecommendationForPrompt(lastMsg);
    if (rec.matchedProducts.length > 0) {
      let response = `${rec.explanationText}\n\n`;
      rec.matchedProducts.forEach((item, index) => {
        response += `### ${index + 1}. ${item.product.brand} ${item.product.title}\n`;
        response += `- **Price**: ₹${item.product.price.toLocaleString('en-IN')}\n`;
        response += `- **Key Spec**: ${item.product.specs.Processor || item.product.specs.Resolution || item.product.specs.Ports || 'Enterprise Grade'}\n`;
        response += `- **Match Score**: ${(item.score * 100).toFixed(1)}% Match\n`;
        response += `- *AI Explanation*: ${item.explanation}\n\n`;
      });
      response += `Would you like me to add any of these items to your cart, or provide detailed technical specifications?`;
      return response;
    }

    return `I am processing your inquiry: "${messages[messages.length - 1].content}". While I can find details on our servers, laptops, switches, and camera security equipment, it seems this is outside my immediate database bounds. Could you specify if you are looking for enterprise hardware, IT installation services, or AMC bookings?`;
  }
}

function qMatch(str: string, terms: string[]): boolean {
  return terms.some(t => str.includes(t));
}

export const aiEngine = new AiEngine();
