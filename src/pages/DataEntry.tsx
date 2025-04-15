
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaterQualityFormData } from "@/types/waterQuality";
import { miningSites } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { 
  ThermometerIcon, 
  DropletIcon, 
  ZapIcon, 
  CloudDrizzleIcon,
  FlaskConicalIcon,
  HeartPulseIcon,
  BugIcon,
  AlertTriangleIcon
} from "lucide-react";

export default function DataEntry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WaterQualityFormData>({
    defaultValues: {
      temperature: 0,
      pH: 7,
      conductivity: 0,
      dissolvedOxygen: 0,
      turbidity: 0,
      salinity: 0,
      nitrates: 0,
      nitrites: 0,
      ammonium: 0,
      phosphates: 0,
      suspendedSolids: 0,
      fecalColiforms: 0,
      eColi: 0,
      pathogens: "",
      ibgn: 0,
      lead: 0,
      mercury: 0,
      arsenic: 0,
      cadmium: 0,
      chromium: 0,
      copper: 0,
      zinc: 0,
      hydrocarbons: 0,
      organicSolvents: 0,
      pesticides: 0,
      siteId: "",
      location: {
        latitude: 0,
        longitude: 0
      },
      notes: ""
    }
  });

  const onSubmit = async (data: WaterQualityFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date(),
          collectedBy: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      toast({
        title: "Données enregistrées",
        description: "Les données de qualité d'eau ont été sauvegardées avec succès.",
      });

      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement des données.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saisie des Données</h1>
          <p className="text-muted-foreground">
            Formulaire de saisie des paramètres de qualité d'eau
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
              <CardDescription>
                Sélectionnez le site et la localisation des mesures
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Minier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un site" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {miningSites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="physicochemical" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="physicochemical">
                <ThermometerIcon className="w-4 h-4 mr-2" />
                Physico-chimique
              </TabsTrigger>
              <TabsTrigger value="biological">
                <HeartPulseIcon className="w-4 h-4 mr-2" />
                Biologique
              </TabsTrigger>
              <TabsTrigger value="metals">
                <AlertTriangleIcon className="w-4 h-4 mr-2" />
                Métaux Lourds
              </TabsTrigger>
              <TabsTrigger value="chemicals">
                <FlaskConicalIcon className="w-4 h-4 mr-2" />
                Autres Chimiques
              </TabsTrigger>
            </TabsList>

            <TabsContent value="physicochemical">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres Physico-chimiques</CardTitle>
                  <CardDescription>
                    Mesures des propriétés physiques et chimiques de l'eau
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ParameterInput
                      form={form}
                      name="temperature"
                      label="Température"
                      unit="°C"
                      icon={<ThermometerIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="pH"
                      label="pH"
                      unit=""
                      icon={<DropletIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="conductivity"
                      label="Conductivité"
                      unit="μS/cm"
                      icon={<ZapIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="dissolvedOxygen"
                      label="Oxygène Dissous"
                      unit="mg/L"
                      icon={<DropletIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="turbidity"
                      label="Turbidité"
                      unit="NTU"
                      icon={<CloudDrizzleIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="salinity"
                      label="Salinité"
                      unit="g/L"
                      icon={<DropletIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="nitrates"
                      label="Nitrates"
                      unit="mg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="nitrites"
                      label="Nitrites"
                      unit="mg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="ammonium"
                      label="Ammonium"
                      unit="mg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="phosphates"
                      label="Phosphates"
                      unit="mg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="suspendedSolids"
                      label="MES"
                      unit="mg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="biological">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres Biologiques</CardTitle>
                  <CardDescription>
                    Indicateurs biologiques de la qualité de l'eau
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ParameterInput
                      form={form}
                      name="fecalColiforms"
                      label="Coliformes Fécaux"
                      unit="UFC/100mL"
                      icon={<BugIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="eColi"
                      label="E. coli"
                      unit="UFC/100mL"
                      icon={<BugIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="ibgn"
                      label="IBGN"
                      unit=""
                      icon={<HeartPulseIcon className="w-4 h-4" />}
                    />
                    <FormField
                      control={form.control}
                      name="pathogens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pathogènes Détectés</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Description des pathogènes observés..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metals">
              <Card>
                <CardHeader>
                  <CardTitle>Métaux Lourds</CardTitle>
                  <CardDescription>
                    Concentrations en métaux lourds dans l'eau
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ParameterInput
                      form={form}
                      name="lead"
                      label="Plomb (Pb)"
                      unit="μg/L"
                      icon={<AlertTriangleIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="mercury"
                      label="Mercure (Hg)"
                      unit="μg/L"
                      icon={<AlertTriangleIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="arsenic"
                      label="Arsenic (As)"
                      unit="μg/L"
                      icon={<AlertTriangleIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="cadmium"
                      label="Cadmium (Cd)"
                      unit="μg/L"
                      icon={<AlertTriangleIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="chromium"
                      label="Chrome (Cr)"
                      unit="μg/L"
                      icon={<AlertTriangleIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="copper"
                      label="Cuivre (Cu)"
                      unit="μg/L"
                      icon={<AlertTriangleIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="zinc"
                      label="Zinc (Zn)"
                      unit="μg/L"
                      icon={<AlertTriangleIcon className="w-4 h-4" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chemicals">
              <Card>
                <CardHeader>
                  <CardTitle>Autres Paramètres Chimiques</CardTitle>
                  <CardDescription>
                    Mesures des polluants organiques et autres substances chimiques
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ParameterInput
                      form={form}
                      name="hydrocarbons"
                      label="Hydrocarbures"
                      unit="mg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="organicSolvents"
                      label="Solvants Organiques"
                      unit="mg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                    <ParameterInput
                      form={form}
                      name="pesticides"
                      label="Pesticides"
                      unit="μg/L"
                      icon={<FlaskConicalIcon className="w-4 h-4" />}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Notes et Observations</CardTitle>
              <CardDescription>
                Ajoutez des commentaires ou observations supplémentaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observations particulières, conditions météorologiques..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Réinitialiser
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer les données"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Composant réutilisable pour les champs de paramètres
function ParameterInput({ 
  form, 
  name, 
  label, 
  unit, 
  icon 
}: { 
  form: any;
  name: string;
  label: string;
  unit: string;
  icon: React.ReactNode;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {icon} {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type="number" 
                step="any" 
                {...field} 
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
              />
              {unit && (
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                  {unit}
                </span>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
