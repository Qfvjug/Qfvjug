import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaYoutube,
  FaDiscord,
  FaTwitch,
  FaGithub,
  FaPatreon,
  FaWhatsapp,
} from "react-icons/fa";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// QR Code SVG Component
const QRCode = () => (
  <div className="bg-white p-2 rounded-lg shadow-sm">
    <div className="w-32 h-32 bg-black p-2">
      <div className="w-full h-full bg-white grid grid-cols-5 grid-rows-5 gap-1">
        {/* Mock QR code pattern */}
        <div className="col-span-2 row-span-2 bg-black rounded-sm"></div>
        <div className="col-span-1 row-span-2 bg-white rounded-sm"></div>
        <div className="col-span-2 row-span-2 bg-black rounded-sm"></div>

        <div className="col-span-2 row-span-1 bg-white rounded-sm"></div>
        <div className="col-span-1 row-span-1 bg-black rounded-sm"></div>
        <div className="col-span-2 row-span-1 bg-white rounded-sm"></div>

        <div className="col-span-2 row-span-2 bg-black rounded-sm"></div>
        <div className="col-span-1 row-span-2 bg-white rounded-sm"></div>
        <div className="col-span-2 row-span-2 bg-black rounded-sm"></div>
      </div>
    </div>
  </div>
);

const SocialLinks = () => {
  const [qrKey, setQrKey] = useState(1); // To force QR code regeneration
  const { toast } = useToast();

  const handleGenerateQR = () => {
    setQrKey((prev) => prev + 1);
    toast({
      title: "QR Code Generated",
      description: "A new QR code has been generated for the website.",
    });
  };

  // Social media platforms with their colors and icons
  const socialPlatforms = [
    {
      name: "YouTube",
      icon: FaYoutube,
      color: "#FF0000",
      url: "https://youtube.com/channel/UCfvPPfsOkPkAU6cfCfnIp0A",
    },
    {
      name: "Discord",
      icon: FaDiscord,
      color: "#5865F2",
      url: "https://discord.gg/PSYb9Zyk",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "#25D366",
      url: "https://whatsapp.com/channel/0029VaeYRX4HltYAwQ4Phn2g ",
    },
    {
      name: "Twitch",
      icon: FaTwitch,
      color: "#6441A4",
      url: "https://twitch.tv/qfvjug",
    },
    {
      name: "GitHub",
      icon: FaGithub,
      color: "#181717",
      url: "https://github.com/Qfvjug",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Connect With Me</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Follow me on social media to stay updated with the latest videos,
          games, and behind-the-scenes content.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
          {socialPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 rounded-xl bg-card border border-border hover:shadow-md transition-all duration-200"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: platform.color }}
              >
                <platform.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium">{platform.name}</span>
            </a>
          ))}
        </div>

        {/* QR Code Section */}
        <div className="mt-12 max-w-sm mx-auto bg-card rounded-xl overflow-hidden border border-border flex flex-col md:flex-row">
          <div className="p-6 md:border-r border-border flex items-center justify-center md:w-1/2">
            <QRCode key={qrKey} />
          </div>
          <div className="p-6 md:w-1/2">
            <h3 className="font-semibold mb-2">Scan to Visit</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Scan this QR code to access my website from your mobile device.
            </p>
            <Button className="w-full" onClick={handleGenerateQR}>
              Generate New QR
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialLinks;
