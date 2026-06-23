import { ScriptGenerator } from "@/components/ScriptGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageGenerationSection } from "@/components/images/ImageGenerationSection";
import { VideoGenerationSection } from "@/components/video/VideoGenerationSection";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-7xl mx-auto flex justify-end mb-4">
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
      <Tabs defaultValue="scripts" className="max-w-7xl mx-auto">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
          <TabsTrigger value="scripts">Roteiros</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scripts">
          <ScriptGenerator />
        </TabsContent>
        
        <TabsContent value="images">
          <ImageGenerationSection />
        </TabsContent>
        
        <TabsContent value="videos">
          <VideoGenerationSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
