import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Mail, Smartphone } from "lucide-react";
import { FaYoutube, FaDiscord, FaTwitch, FaGithub } from "react-icons/fa";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest('POST', '/api/subscribers', {
        email,
        notificationType: 'all'
      });
      
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive updates about new videos and releases.",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer id="contact" className="bg-secondary text-white py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="font-bold text-xl">Qfvjug</span>
              </Link>
            </div>
            <p className="text-gray-300 mb-6">
              Creating awesome YouTube content, games, and tools for developers and gamers.
              Join me on this creative journey!
            </p>
            <div className="flex space-x-4">
              <a href="https://youtube.com/channel/UCfvPPfsOkPkAU6cfCfnIp0A" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                <FaYoutube className="w-6 h-6" />
              </a>
              <a href="https://discord.gg/your-invitation-code" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                <FaDiscord className="w-6 h-6" />
              </a>
              <a href="https://twitch.tv/qfvjug" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                <FaTwitch className="w-6 h-6" />
              </a>
              <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors duration-200">
                <FaGithub className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/videos" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Videos
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Downloads
                </Link>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors duration-200">Contact</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                <span className="text-gray-300">contact@qfvjug.com</span>
              </li>
              <li className="flex items-start">
                <Smartphone className="h-5 w-5 mr-2 mt-0.5 text-gray-300" />
                <span className="text-gray-300">Business inquiries: business@qfvjug.com</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-4">Newsletter</h3>
              <form onSubmit={handleSubscribe} className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="rounded-l-lg w-full bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <Button 
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-r-lg" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Qfvjug. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Hosted on <a href="https://replit.com" className="text-primary hover:underline">Replit</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
