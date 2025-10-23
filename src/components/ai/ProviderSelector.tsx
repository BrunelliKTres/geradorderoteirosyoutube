import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AI_PROVIDERS, AIProvider } from "@/types/ai-providers";

interface ProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

export const ProviderSelector = ({ selectedProvider, onProviderChange }: ProviderSelectorProps) => {
  return (
    <div>
      <Label htmlFor="provider">Provider de IA</Label>
      <Select
        value={selectedProvider.id}
        onValueChange={(value) => {
          const provider = AI_PROVIDERS.find(p => p.id === value);
          if (provider) onProviderChange(provider);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o provider" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {AI_PROVIDERS.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span>{provider.icon}</span>
                  <span>{provider.name}</span>
                </span>
                {provider.costInfo && (
                  <span className="text-xs text-muted-foreground ml-6">
                    {provider.costInfo}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};