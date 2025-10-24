import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Video, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface VideoGenerationSectionProps {
  script: string;
}

type VideoProvider = "runway" | "kling";

export const VideoGenerationSection = ({ script }: VideoGenerationSectionProps) => {
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider>("runway");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("");
  const [showApiModal, setShowApiModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const { toast } = useToast();

  const providers = {
    runway: {
      name: "Runway Gen-3",
      icon: "🎬",
      keyName: "runway_api_key",
      getApiKeyUrl: "https://app.runwayml.com/",
      description: "Alta qualidade, 5-10 segundos"
    },
    kling: {
      name: "Kling AI",
      icon: "🎥",
      keyName: "kling_api_key",
      getApiKeyUrl: "https://klingai.com/",
      description: "Até 10 segundos, estilo cinematográfico"
    }
  };

  const generateVideo = async () => {
    const provider = providers[selectedProvider];
    let apiKey = localStorage.getItem(provider.keyName);

    if (!apiKey) {
      setShowApiModal(true);
      toast({
        title: "API Key necessária",
        description: `Configure sua API key do ${provider.name} para gerar vídeos.`,
        variant: "destructive",
      });
      return;
    }

    if (!videoPrompt && !script) {
      toast({
        title: "Prompt necessário",
        description: "Forneça um prompt para gerar o vídeo.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Usar o prompt customizado ou extrair do roteiro
      const finalPrompt = videoPrompt || `Create a video based on this script: ${script.substring(0, 500)}`;

      if (selectedProvider === "runway") {
        await generateRunwayVideo(finalPrompt, apiKey);
      } else {
        await generateKlingVideo(finalPrompt, apiKey);
      }

      toast({
        title: "Vídeo gerado!",
        description: `Vídeo criado com sucesso usando ${provider.name}.`,
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao gerar vídeo",
        description: `Verifique sua API key do ${provider.name} e tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRunwayVideo = async (prompt: string, apiKey: string) => {
    // Runway Gen-3 API
    const response = await fetch("https://api.runwayml.com/v1/video/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: 5, // 5 segundos
        resolution: "720p",
      }),
    });

    if (!response.ok) {
      throw new Error(`Runway API error: ${response.status}`);
    }

    const data = await response.json();
    setGeneratedVideoUrl(data.video_url || data.url);
  };

  const generateKlingVideo = async (prompt: string, apiKey: string) => {
    // Kling AI API
    const response = await fetch("https://api.klingai.com/v1/video/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: 10,
        aspect_ratio: "16:9",
      }),
    });

    if (!response.ok) {
      throw new Error(`Kling API error: ${response.status}`);
    }

    const data = await response.json();
    setGeneratedVideoUrl(data.video_url || data.result_url);
  };

  const saveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem(providers[selectedProvider].keyName, tempApiKey.trim());
      toast({
        title: "API Key salva",
        description: `API key do ${providers[selectedProvider].name} configurada com sucesso.`,
      });
      setShowApiModal(false);
      setTempApiKey("");
    }
  };

  const currentProvider = providers[selectedProvider];

  return (
    <Card className="shadow-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Gerar Vídeo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="video-provider">Provedor de Vídeo</Label>
          <Select
            value={selectedProvider}
            onValueChange={(value) => setSelectedProvider(value as VideoProvider)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {Object.entries(providers).map(([key, provider]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{provider.icon}</span>
                    <div className="flex flex-col items-start">
                      <span>{provider.name}</span>
                      <span className="text-xs text-muted-foreground">{provider.description}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {localStorage.getItem(currentProvider.keyName) 
              ? `API key do ${currentProvider.name} configurada` 
              : `Configure a API key do ${currentProvider.name}`}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="video-prompt">Prompt do Vídeo</Label>
            <Dialog open={showApiModal} onOpenChange={setShowApiModal}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings2 className="w-4 h-4 mr-2" />
                  API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Configurar API Key - {currentProvider.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="api-key-input">API Key</Label>
                    <Input
                      id="api-key-input"
                      type="password"
                      placeholder="Cole sua API key aqui"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Obtenha sua API key em:</p>
                    <a 
                      href={currentProvider.getApiKeyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {currentProvider.getApiKeyUrl}
                    </a>
                  </div>
                  <Button onClick={saveApiKey} className="w-full">
                    Salvar API Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Textarea
            id="video-prompt"
            placeholder="Descreva o vídeo que deseja gerar (ou deixe vazio para usar o roteiro)"
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Se deixar vazio, o vídeo será gerado baseado no roteiro
          </p>
        </div>

        <Button
          onClick={generateVideo}
          disabled={isGenerating || !script}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando vídeo...
            </>
          ) : (
            <>
              <Video className="w-4 h-4 mr-2" />
              Gerar Vídeo com {currentProvider.name}
            </>
          )}
        </Button>

        {generatedVideoUrl && (
          <div className="space-y-2">
            <Label>Vídeo Gerado</Label>
            <video 
              src={generatedVideoUrl} 
              controls 
              className="w-full rounded-lg border"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(generatedVideoUrl, "_blank")}
            >
              Abrir em Nova Aba
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
