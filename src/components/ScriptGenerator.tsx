import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Download, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AI_PROVIDERS, AIProvider, ScriptData } from "@/types/ai-providers";
import { APIKeyModal } from "@/components/ai/APIKeyModal";
import { ProviderSelector } from "@/components/ai/ProviderSelector";
import { ScriptGeneratorAPI } from "@/components/ai/ScriptGeneratorAPI";
import { ImageGenerationSection } from "@/components/images/ImageGenerationSection";
import { AudioGenerationSection } from "@/components/audio/AudioGenerationSection";
import { CombinedSection } from "@/components/combined/CombinedSection";
import { VideoGenerationSection } from "@/components/video/VideoGenerationSection";
import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export const ScriptGenerator = () => {
  console.log("ScriptGenerator component is rendering");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AI_PROVIDERS[0]);
  const [scriptData, setScriptData] = useState<ScriptData>({
    topic: "",
    duration: "",
    style: "",
    styleKeywords: "",
    language: "",
    niche: "",
    subniche: "",
    microniche: "",
    nanoniche: "",
    audience: "",
    additionalInfo: "",
    youtubeLink: "",
    qualified: false,
    characteristics: 5,
  });
  const [generatedScript, setGeneratedScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAPIModal, setShowAPIModal] = useState(false);
  const [showYTModal, setShowYTModal] = useState(false);
  const { toast } = useToast();

  const generateScript = async () => {
    const apiKey = localStorage.getItem(selectedProvider.keyName);
    
    if (!apiKey) {
      setShowAPIModal(true);
      return;
    }

    if (!scriptData.topic || !scriptData.duration || !scriptData.style) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o tópico, duração e estilo do vídeo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const script = await ScriptGeneratorAPI.generateScript(selectedProvider, scriptData, apiKey);
      setGeneratedScript(script);

      toast({
        title: "Roteiro gerado!",
        description: `Roteiro criado com sucesso usando ${selectedProvider.name}.`,
      });
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao gerar roteiro",
        description: `Verifique sua API key do ${selectedProvider.name} e tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadScript = async () => {
    if (!generatedScript) return;

    try {
      // Divide o script em parágrafos
      const lines = generatedScript.split('\n');
      const children: Paragraph[] = [];

      // Adiciona título
      children.push(
        new Paragraph({
          text: scriptData.topic || "Roteiro YouTube",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Adiciona informações do roteiro
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Duração: ", bold: true }),
            new TextRun(scriptData.duration || "N/A"),
          ],
          spacing: { after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Estilo: ", bold: true }),
            new TextRun(scriptData.style || "N/A"),
          ],
          spacing: { after: 200 },
        })
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Gerado por: ", bold: true }),
            new TextRun(`${selectedProvider.name}`),
          ],
          spacing: { after: 400 },
        })
      );

      // Adiciona linha separadora
      children.push(
        new Paragraph({
          text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );

      // Processa cada linha do roteiro
      for (const line of lines) {
        if (line.trim() === '') {
          children.push(new Paragraph({ text: "" }));
          continue;
        }

        // Detecta títulos (linhas que começam com #, ## ou são MAIÚSCULAS)
        if (line.startsWith('#')) {
          const level = line.startsWith('###') ? HeadingLevel.HEADING_3 
            : line.startsWith('##') ? HeadingLevel.HEADING_2 
            : HeadingLevel.HEADING_1;
          
          children.push(
            new Paragraph({
              text: line.replace(/^#+\s*/, ''),
              heading: level,
              spacing: { before: 300, after: 200 },
            })
          );
        } else if (line === line.toUpperCase() && line.length > 3 && /^[A-Z\s]+$/.test(line)) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line, bold: true, size: 28 })],
              spacing: { before: 300, after: 200 },
            })
          );
        } else {
          children.push(
            new Paragraph({
              text: line,
              spacing: { after: 150 },
            })
          );
        }
      }

      // Cria o documento
      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      // Gera o blob e faz download
      const blob = await Packer.toBlob(doc);
      const fileName = `roteiro-${scriptData.topic.replace(/\s+/g, "-")}-${selectedProvider.id}.docx`;
      saveAs(blob, fileName);

      toast({
        title: "Download concluído",
        description: "Roteiro salvo em formato .docx",
      });
    } catch (error) {
      console.error("Erro ao gerar DOCX:", error);
      toast({
        title: "Erro no download",
        description: "Não foi possível gerar o arquivo .docx",
        variant: "destructive",
      });
    }
  };

  // Integração com YouTube Data API
  const YOUTUBE_PROVIDER: AIProvider = {
    id: 'youtube',
    name: 'YouTube Data API',
    icon: '▶️',
    endpoint: 'https://www.googleapis.com/youtube/v3',
    keyName: 'youtube_api_key',
    getApiKeyUrl: 'https://console.cloud.google.com/apis/credentials'
  };

  const parseYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
      const v = u.searchParams.get('v');
      return v || null;
    } catch {
      return null;
    }
  };

  const classifyFrom = (text: string, tags: string[]) => {
    const lower = text.toLowerCase();
    const categories = [
      { niche: 'Finanças', pattern: /(finan|invest|ação|bolsa|etf|trader|cripto|bitcoin|cagr|dividend)/i },
      { niche: 'Tecnologia', pattern: /(tecno|program|dev|javascript|python|ia|a[ií]|algorit|api|kubernetes|docker|cloud)/i },
      { niche: 'Saúde e Fitness', pattern: /(saúde|saude|fitness|treino|dieta|nutri|muscula|hiit)/i },
      { niche: 'Marketing', pattern: /(marketing|venda|tráfego|trafego|anúncio|anuncio|copy|roi|funil)/i },
      { niche: 'Games', pattern: /(game|jogo|gamer|stream|fortnite|minecraft|valorant)/i },
    ];
    let niche = 'Geral';
    for (const c of categories) {
      if (c.pattern.test(lower) || tags.some(t => c.pattern.test(t.toLowerCase()))) {
        niche = c.niche;
        break;
      }
    }
    const subniche = tags[0] || '';
    const microniche = tags[1] || '';
    const nanoniche = tags[2] || '';
    const advanced = /(avançad|intermediár|framework|api|derivad|cagr|roi|backtest|regress|estatístic|neural|kubernetes|docker|otimiza|quantitativo|hedge|opções|futuros|fine-?tune|prompt engineering|llm)/i;
    const qualified = advanced.test(text) || tags.length >= 8;
    return { niche, subniche, microniche, nanoniche, qualified };
  };

  const fetchYouTubeData = async () => {
    const key = localStorage.getItem(YOUTUBE_PROVIDER.keyName);
    if (!key) {
      setShowYTModal(true);
      toast({ title: 'API do YouTube necessária', description: 'Cole sua API key do YouTube para buscar dados.' });
      return;
    }
    const link = scriptData.youtubeLink.trim();
    if (!link) {
      toast({ title: 'Informe o link do YouTube', description: 'Cole a URL do vídeo para buscar os dados.' });
      return;
    }
    const id = parseYouTubeId(link);
    if (!id) {
      toast({ title: 'Link inválido', description: 'Não foi possível identificar o ID do vídeo.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(`${YOUTUBE_PROVIDER.endpoint}/videos?part=snippet,contentDetails,statistics&id=${id}&key=${key}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const item = data.items?.[0];
      if (!item) throw new Error('Vídeo não encontrado');
      const title: string = item.snippet?.title || '';
      const description: string = item.snippet?.description || '';
      const tags: string[] = item.snippet?.tags || [];
      const analysis = classifyFrom(`${title}\n${description}`, tags);
      setScriptData(prev => ({ ...prev, ...analysis }));
      toast({ title: 'Dados importados', description: 'Sugerimos nicho e qualificação a partir do vídeo.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Falha ao buscar do YouTube', description: 'Verifique o link e sua API key.', variant: 'destructive' });
    }
  };

  console.log("ScriptGenerator about to render JSX");
  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-card rounded-full border">
            <Play className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-youtube bg-clip-text text-transparent">
              Gerador de Roteiros YouTube
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Crie roteiros profissionais para seus vídeos do YouTube usando múltiplas IAs. 
            Suporte para Gemini, ChatGPT, Claude, Grok e Mistral.
          </p>
        </div>

        <div className="space-y-6">
          {/* Formulário */}
          <Card className="shadow-dark max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações do Roteiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProviderSelector 
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
              />

              <div>
                <Label htmlFor="topic">Tópico do Vídeo *</Label>
                <Input
                  id="topic"
                  placeholder="Ex: Como criar thumbnails que chamam atenção"
                  value={scriptData.topic}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, topic: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duração (min) *</Label>
                  <Select
                    value={scriptData.duration}
                    onValueChange={(value) =>
                      setScriptData({ ...scriptData, duration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Duração" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border max-h-[300px]">
                      <SelectItem value="1-3">1-3 min</SelectItem>
                      <SelectItem value="3-5">3-5 min</SelectItem>
                      <SelectItem value="5-10">5-10 min</SelectItem>
                      <SelectItem value="10-15">10-15 min</SelectItem>
                      <SelectItem value="15-20">15-20 min</SelectItem>
                      <SelectItem value="20-25">20-25 min</SelectItem>
                      <SelectItem value="25-30">25-30 min</SelectItem>
                      <SelectItem value="30-35">30-35 min</SelectItem>
                      <SelectItem value="35-40">35-40 min</SelectItem>
                      <SelectItem value="40-45">40-45 min</SelectItem>
                      <SelectItem value="45-60">45-60 min</SelectItem>
                      <SelectItem value="60+">60+ min</SelectItem>
                      <SelectItem value="65">65 min</SelectItem>
                      <SelectItem value="70">70 min</SelectItem>
                      <SelectItem value="75">75 min</SelectItem>
                      <SelectItem value="80">80 min</SelectItem>
                      <SelectItem value="85">85 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="95">95 min</SelectItem>
                      <SelectItem value="100">100 min</SelectItem>
                      <SelectItem value="105">105 min</SelectItem>
                      <SelectItem value="110">110 min</SelectItem>
                      <SelectItem value="115">115 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="style">Estilo *</Label>
                  <Select
                    value={scriptData.style}
                    onValueChange={(value) =>
                      setScriptData({ ...scriptData, style: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estilo" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="vlog-pessoal">Vlog Pessoal</SelectItem>
                      <SelectItem value="tutorial">Tutorial / How-To</SelectItem>
                      <SelectItem value="educacional">Educacional / Explicativo</SelectItem>
                      <SelectItem value="documentario">Documentário Curto</SelectItem>
                      <SelectItem value="top-10">Top 10 / Listas</SelectItem>
                      <SelectItem value="experimentos">Experimentos</SelectItem>
                      <SelectItem value="opiniao">Opinião / Comentário</SelectItem>
                      <SelectItem value="reacao">Reação (React)</SelectItem>
                      <SelectItem value="estudo-caso">Estudo de Caso</SelectItem>
                      <SelectItem value="desafio">Desafio</SelectItem>
                      <SelectItem value="analise-tecnica">Análise Técnica / Gráfica</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia e Gadgets</SelectItem>
                      <SelectItem value="entrevistas">Entrevistas / Podcast</SelectItem>
                      <SelectItem value="curiosidades">Curiosidades / Fatos Rápidos</SelectItem>
                      <SelectItem value="motivacional">Motivacional / Mentalidade</SelectItem>
                      <SelectItem value="comparativo">Comparativo</SelectItem>
                      <SelectItem value="misterios">Mistérios e Teorias</SelectItem>
                      <SelectItem value="turismo">Turismo / Viagens</SelectItem>
                      <SelectItem value="ferramentas">Ferramentas / Dicas Práticas</SelectItem>
                      <SelectItem value="humor">Humor / Paródia / Satírico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="styleKeywords">Palavras-chave do Estilo</Label>
                <Input
                  id="styleKeywords"
                  placeholder="Ex: enérgico, dinâmico, casual, profissional"
                  value={scriptData.styleKeywords}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, styleKeywords: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="language">Idioma do Roteiro</Label>
                <Select
                  value={scriptData.language}
                  onValueChange={(value) =>
                    setScriptData({ ...scriptData, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-[300px]">
                    <SelectItem value="en">🇺🇸🇬🇧 Inglês</SelectItem>
                    <SelectItem value="zh">🇨🇳 Mandarim Chinês</SelectItem>
                    <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                    <SelectItem value="es">🇪🇸🇲🇽 Espanhol</SelectItem>
                    <SelectItem value="fr">🇫🇷 Francês</SelectItem>
                    <SelectItem value="ar">🇸🇦 Árabe Padrão</SelectItem>
                    <SelectItem value="bn">🇧🇩🇮🇳 Bengali</SelectItem>
                    <SelectItem value="pt-br">🇧🇷🇵🇹 Português</SelectItem>
                    <SelectItem value="ru">🇷🇺 Russo</SelectItem>
                    <SelectItem value="ur">🇵🇰🇮🇳 Urdu</SelectItem>
                    <SelectItem value="id">🇮🇩 Indonésio</SelectItem>
                    <SelectItem value="de">🇩🇪 Alemão</SelectItem>
                    <SelectItem value="ja">🇯🇵 Japonês</SelectItem>
                    <SelectItem value="pcm">🇳🇬 Nigeriano Pidgin</SelectItem>
                    <SelectItem value="mr">🇮🇳 Marati</SelectItem>
                    <SelectItem value="te">🇮🇳 Telugu</SelectItem>
                    <SelectItem value="tr">🇹🇷 Turco</SelectItem>
                    <SelectItem value="ta">🇮🇳🇱🇰 Tâmil</SelectItem>
                    <SelectItem value="pa">🇵🇰 Punjabi Ocidental</SelectItem>
                    <SelectItem value="ko">🇰🇷🇰🇵 Coreano</SelectItem>
                    <SelectItem value="vi">🇻🇳 Vietnamita</SelectItem>
                    <SelectItem value="ha">🇳🇬 Hausa</SelectItem>
                    <SelectItem value="jv">🇮🇩 Javanês</SelectItem>
                    <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                    <SelectItem value="arz">🇪🇬 Egípcio Árabe</SelectItem>
                    <SelectItem value="fa">🇮🇷 Persa (Farsi)</SelectItem>
                    <SelectItem value="th">🇹🇭 Tailandês</SelectItem>
                    <SelectItem value="gu">🇮🇳 Gujarate</SelectItem>
                    <SelectItem value="bho">🇮🇳 Bhojpuri</SelectItem>
                    <SelectItem value="tl">🇵🇭 Tagalog / Filipino</SelectItem>
                    <SelectItem value="yo">🇳🇬 Yoruba</SelectItem>
                    <SelectItem value="ml">🇮🇳 Malaiala</SelectItem>
                    <SelectItem value="my">🇲🇲 Birmanês (Myanmar)</SelectItem>
                    <SelectItem value="su">🇮🇩 Sunda</SelectItem>
                    <SelectItem value="uk">🇺🇦 Ucraniano</SelectItem>
                    <SelectItem value="pl">🇵🇱 Polonês</SelectItem>
                    <SelectItem value="ps">🇦🇫🇵🇰 Pastó</SelectItem>
                    <SelectItem value="kn">🇮🇳 Canarês</SelectItem>
                    <SelectItem value="xh">🇿🇦 Xhosa</SelectItem>
                    <SelectItem value="so">🇸🇴 Somali</SelectItem>
                    <SelectItem value="ms">🇲🇾🇮🇩 Malai</SelectItem>
                    <SelectItem value="or">🇮🇳 Odia</SelectItem>
                    <SelectItem value="apd">🇸🇩 Sudanes Árabe</SelectItem>
                    <SelectItem value="ku">🇹🇷🇮🇶🇸🇾 Curdish</SelectItem>
                    <SelectItem value="ro">🇷🇴 Romeno</SelectItem>
                    <SelectItem value="am">🇪🇹 Amárico</SelectItem>
                    <SelectItem value="cs">🇨🇿 Tcheco</SelectItem>
                    <SelectItem value="nl">🇳🇱🇧🇪 Holandês</SelectItem>
                    <SelectItem value="el">🇬🇷 Grego</SelectItem>
                    <SelectItem value="zu">🇿🇦 Zulu</SelectItem>
                    <SelectItem value="az">🇦🇿 Azerbaijano</SelectItem>
                    <SelectItem value="si">🇱🇰 Cingalês</SelectItem>
                    <SelectItem value="hu">🇭🇺 Húngaro</SelectItem>
                    <SelectItem value="sv">🇸🇪 Sueco</SelectItem>
                    <SelectItem value="he">🇮🇱 Hebraico</SelectItem>
                    <SelectItem value="be">🇧🇾 Bielorrusso</SelectItem>
                    <SelectItem value="da">🇩🇰 Dinamarquês</SelectItem>
                    <SelectItem value="fi">🇫🇮 Finlandês</SelectItem>
                    <SelectItem value="no">🇳🇴 Norueguês</SelectItem>
                    <SelectItem value="sk">🇸🇰 Eslovaco</SelectItem>
                    <SelectItem value="sr">🇷🇸 Sérvio</SelectItem>
                    <SelectItem value="hr">🇭🇷 Croata</SelectItem>
                    <SelectItem value="bg">🇧🇬 Búlgaro</SelectItem>
                    <SelectItem value="ne">🇳🇵 Nepali</SelectItem>
                    <SelectItem value="km">🇰🇭 Khmer</SelectItem>
                    <SelectItem value="mad">🇮🇩 Madurês</SelectItem>
                    <SelectItem value="ce">🇷🇺 Checheno</SelectItem>
                    <SelectItem value="eu">🇪🇸🇫🇷 Basco</SelectItem>
                    <SelectItem value="sq">🇦🇱 Albanês</SelectItem>
                    <SelectItem value="hy">🇦🇲 Armênio</SelectItem>
                    <SelectItem value="ka">🇬🇪 Georgiano</SelectItem>
                    <SelectItem value="lo">🇱🇦 Lao</SelectItem>
                    <SelectItem value="mn">🇲🇳 Mongol</SelectItem>
                    <SelectItem value="ca">🇪🇸🇫🇷 Catalão</SelectItem>
                    <SelectItem value="cy">🇬🇧 Galês</SelectItem>
                    <SelectItem value="is">🇮🇸 Islandês</SelectItem>
                    <SelectItem value="mi">🇳🇿 Maori</SelectItem>
                    <SelectItem value="qu">🇵🇪🇧🇴🇪🇨 Quéchua</SelectItem>
                    <SelectItem value="gn">🇵🇾 Guarani</SelectItem>
                    <SelectItem value="ay">🇧🇴 Aymara</SelectItem>
                    <SelectItem value="nv">🇺🇸 Navajo</SelectItem>
                    <SelectItem value="iu">🇨🇦 Inuit (Inuktitut)</SelectItem>
                    <SelectItem value="ti">🇪🇷🇪🇹 Tigrínia</SelectItem>
                    <SelectItem value="tn">🇧🇼🇿🇦 Tswana</SelectItem>
                    <SelectItem value="sn">🇿🇼 Shona</SelectItem>
                    <SelectItem value="st">🇿🇦🇱🇸 Sesotho</SelectItem>
                    <SelectItem value="ny">🇲🇼 Chichewa</SelectItem>
                    <SelectItem value="lg">🇺🇬 Luganda</SelectItem>
                    <SelectItem value="rw">🇷🇼 Kinyarwanda</SelectItem>
                    <SelectItem value="ig">🇳🇬 Igbo</SelectItem>
                    <SelectItem value="ak">🇬🇭 Akan (Twi)</SelectItem>
                    <SelectItem value="wo">🇸🇳 Wolof</SelectItem>
                    <SelectItem value="ber">🇩🇿🇲🇦 Berbere</SelectItem>
                    <SelectItem value="kk">🇰🇿 Cazaque</SelectItem>
                    <SelectItem value="uz">🇺🇿 Usbeque</SelectItem>
                    <SelectItem value="tg">🇹🇯 Tajique</SelectItem>
                    <SelectItem value="tk">🇹🇲 Turcomeno</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="youtubeLink">Link do YouTube (opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="youtubeLink"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={scriptData.youtubeLink}
                    onChange={(e) =>
                      setScriptData({ ...scriptData, youtubeLink: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" onClick={() => fetchYouTubeData()}>
                    Buscar
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowYTModal(true)}>
                    API
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {localStorage.getItem('youtube_api_key') ? 'API key do YouTube configurada' : 'Configure a API key do YouTube para buscar dados.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="niche">Nicho</Label>
                  <Input
                    id="niche"
                    placeholder="Ex: Finanças pessoais"
                    value={scriptData.niche}
                    onChange={(e) =>
                      setScriptData({ ...scriptData, niche: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="subniche">Sobrenicho</Label>
                  <Input
                    id="subniche"
                    placeholder="Ex: Investimentos para iniciantes"
                    value={scriptData.subniche}
                    onChange={(e) =>
                      setScriptData({ ...scriptData, subniche: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="microniche">Micronicho</Label>
                  <Input
                    id="microniche"
                    placeholder="Ex: ETFs mensais de dividendos"
                    value={scriptData.microniche}
                    onChange={(e) =>
                      setScriptData({ ...scriptData, microniche: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="nanoniche">Nanonicho</Label>
                  <Input
                    id="nanoniche"
                    placeholder="Ex: ETFs de dividendos para estudantes"
                    value={scriptData.nanoniche}
                    onChange={(e) =>
                      setScriptData({ ...scriptData, nanoniche: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="qualified">Público qualificado</Label>
                <Switch
                  id="qualified"
                  checked={scriptData.qualified}
                  onCheckedChange={(checked) =>
                    setScriptData({ ...scriptData, qualified: checked })
                  }
                />
              </div>

              <div>
                <Label htmlFor="characteristics">Número de Características/Pontos por Roteiro</Label>
                <Input
                  id="characteristics"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="Ex: 5"
                  value={scriptData.characteristics || 5}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, characteristics: parseInt(e.target.value) || 5 })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Defina quantas características, pontos principais ou seções o roteiro deve ter
                </p>
              </div>

              <div>
                <Label htmlFor="audience">Público-alvo</Label>
                <Input
                  id="audience"
                  placeholder="Ex: Jovens de 18-25 anos interessados em carreira"
                  value={scriptData.audience}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, audience: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Qualquer informação adicional que possa ajudar a IA a criar um roteiro melhor..."
                  rows={3}
                  value={scriptData.additionalInfo}
                  onChange={(e) =>
                    setScriptData({ ...scriptData, additionalInfo: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={generateScript}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Gerar Roteiro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          <Card className="shadow-dark max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Roteiro Gerado</CardTitle>
                {generatedScript && (
                  <Button onClick={downloadScript} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedScript ? (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatedScript}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Seu roteiro aparecerá aqui após a geração</p>
                  <p className="text-xs mt-2">Provider selecionado: {selectedProvider.icon} {selectedProvider.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Imagem */}
          <div className="max-w-4xl mx-auto">
            <ImageGenerationSection script={generatedScript || ""} />
          </div>

          {/* Áudio */}
          <div className="max-w-4xl mx-auto">
            <AudioGenerationSection script={generatedScript || ""} />
          </div>

          {/* Vídeo */}
          <div className="max-w-4xl mx-auto">
            <VideoGenerationSection script={generatedScript || ""} />
          </div>

          {/* Combinar */}
          <div className="max-w-4xl mx-auto">
            <CombinedSection script={generatedScript || ""} />
          </div>
        </div>
      </div>

      <APIKeyModal
        isOpen={showAPIModal}
        onClose={() => setShowAPIModal(false)}
        onSave={() => {}}
        provider={selectedProvider}
      />
      <APIKeyModal
        isOpen={showYTModal}
        onClose={() => setShowYTModal(false)}
        onSave={() => { fetchYouTubeData(); }}
        provider={YOUTUBE_PROVIDER}
      />
    </div>
  );
};