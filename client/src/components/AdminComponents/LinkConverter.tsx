import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";

interface ConvertResponse {
  originalUrl: string;
  convertedUrl: string;
  isConverted: boolean;
}

const LinkConverter: React.FC = () => {
  const { t } = useTranslation();
  const [link, setLink] = useState<string>("");
  const [convertedLink, setConvertedLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConvert = async () => {
    if (!link.trim()) {
      toast({
        title: t("error"),
        description: t("linkConverter.pleaseEnterLink"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("/api/convert-link", {
        method: "POST",
        body: JSON.stringify({ url: link }),
      }) as ConvertResponse;

      if (response.convertedUrl) {
        setConvertedLink(response.convertedUrl);
        if (response.isConverted) {
          toast({
            title: t("success"),
            description: t("linkConverter.linkConverted"),
          });
        } else {
          toast({
            title: t("info"),
            description: t("linkConverter.linkUnchanged"),
          });
        }
      }
    } catch (error) {
      toast({
        title: t("error"),
        description: t("linkConverter.conversionError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (convertedLink) {
      navigator.clipboard.writeText(convertedLink);
      toast({
        title: t("success"),
        description: t("linkConverter.linkCopied"),
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("linkConverter.title")}</CardTitle>
        <CardDescription>{t("linkConverter.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              placeholder={t("linkConverter.enterLink")}
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleConvert}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? t("loading") : t("linkConverter.convert")}
            </Button>
          </div>
          {convertedLink && (
            <div className="space-y-2">
              <div className="font-semibold">{t("linkConverter.convertedLink")}:</div>
              <Textarea
                value={convertedLink}
                readOnly
                className="h-24"
              />
              <Button onClick={handleCopy} variant="outline" className="w-full">
                {t("linkConverter.copyToClipboard")}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkConverter;