import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

// Types voor de beslisboom
type Antwoord = {
    tekst: string;
    vervolg: string; // naam van volgende node
};

type Node = {
    naam: string;
    titel?: string;
    vraag?: string | null;
    uitkomst?: string | null;
    antwoorden: Antwoord[];
};

type Beslisboom = {
    entryNode: string; // naam van de start node
    shortcuts: string[];
    nodes: Node[];
};

type Stap = {
    vraag: string;
    antwoord: string;
};

type BeslisboomProps = {
    beslisboom: Beslisboom;
};

export function Beslisboom({ beslisboom }: BeslisboomProps) {
    const [huidigeNodeNaam, setHuidigeNodeNaam] = useState<string | null>(beslisboom.entryNode);
    const [geschiedenis, setGeschiedenis] = useState<Stap[]>([]);
    const [resultaat, setResultaat] = useState<string | null>(null);

    // Helper functie om een node op te halen op basis van naam
    const getNode = (naam: string): Node | undefined => {
        return beslisboom.nodes.find(node => node.naam === naam);
    };

    const huidigeNode = huidigeNodeNaam ? getNode(huidigeNodeNaam) : null;
    const isLeaf = (node: Node) => node.antwoorden.length === 0;
    const shortcutNodes = beslisboom.shortcuts
        .map(shortcutNaam => getNode(shortcutNaam))
        .filter((node): node is Node => Boolean(node));

    // Handler voor het selecteren van een antwoord
    const handleAntwoord = (antwoord: Antwoord) => {
        if (!huidigeNode || isLeaf(huidigeNode) || !huidigeNode.vraag) return;

        // Voeg de huidige vraag en antwoord toe aan de geschiedenis
        setGeschiedenis([...geschiedenis, {
            vraag: huidigeNode.vraag,
            antwoord: antwoord.tekst
        }]);

        // Navigeer naar de volgende node
        const volgendeNode = getNode(antwoord.vervolg);
        if (volgendeNode) {
            if (isLeaf(volgendeNode)) {
                // Volgende node is een blad
                setResultaat(volgendeNode.uitkomst ?? volgendeNode.vraag ?? volgendeNode.naam);
                setHuidigeNodeNaam(null);
            } else {
                // Volgende node heeft een vraag
                setHuidigeNodeNaam(antwoord.vervolg);
            }
        }
    };

    // Reset functie om opnieuw te beginnen
    const handleReset = () => {
        setHuidigeNodeNaam(beslisboom.entryNode);
        setGeschiedenis([]);
        setResultaat(null);
    };

    const handleShortcut = (nodeNaam: string) => {
        const node = getNode(nodeNaam);
        if (node && isLeaf(node)) {
            setResultaat(node.uitkomst ?? node.vraag ?? node.naam);
            setHuidigeNodeNaam(null);
            setGeschiedenis([]);
            return;
        }
        setHuidigeNodeNaam(nodeNaam);
        setGeschiedenis([]);
        setResultaat(null);
    };

    return (
        <div className="max-w-5xl mx-auto p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                {shortcutNodes.length > 0 && (
                    <div className="w-full lg:w-64 space-y-4">
                        <Card className="border border-slate-200">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm font-normal text-muted-foreground">
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 pt-0">
                                {shortcutNodes.map(node => (
                                    <button
                                        key={node.naam}
                                        type="button"
                                        className="text-left text-base font-medium text-green-700 hover:underline"
                                        onClick={() => handleShortcut(node.naam)}
                                    >
                                        {node.titel ?? node.naam}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>

                    </div>
                )}

                <div className="flex-1 space-y-4">
                    {/* Geschiedenis van beantwoorde vragen */}
                    {geschiedenis.length > 0 && (
                        <div className="space-y-2">
                            {geschiedenis.map((stap, index) => (
                                <Card key={index} className="border-l-4 border-l-green-500">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-muted-foreground">{stap.vraag}</p>
                                                <p className="text-lg font-semibold text-green-700">{stap.antwoord}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Huidige vraag */}
                    {huidigeNode && !isLeaf(huidigeNode) && (
                        <>
                            {geschiedenis.length === 0 && (
                                <Card className="border border-slate-200">
                                    <CardContent className="py-4">
                                        <p className="py-1 text-sm text-muted-foreground">
                                            Deze beslisboom leidt je langs een aantal vragen om uiteindelijk te bepalen wat voor soort potje het beste past bij jouw situatie. Klik op een antwoord om naar de volgende vraag te gaan, of gebruik de snelkoppelingen aan de zijkant om direct naar een specifieke vraag te springen.
                                        </p>
                                        <p className="py-1 text-sm text-muted-foreground">
                                            Let op: de vraagboom is nog niet af. De uitkomsten bevatten nog Lorem Ipsum tekst en sommige antwoorden zijn wat suggesttief :-).
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                            <Card className="border-2 border-primary">
                                <CardHeader>
                                    {huidigeNode.uitkomst && (
                                        <div
                                            className="text-sm font-medium text-muted-foreground leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: huidigeNode.uitkomst }}
                                        />
                                    )}
                                    {huidigeNode.vraag && (
                                        <CardTitle className="text-base">{huidigeNode.vraag}</CardTitle>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {huidigeNode.antwoorden.map((antwoord, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary hover:text-primary-foreground"
                                            onClick={() => handleAntwoord(antwoord)}
                                        >
                                            {antwoord.tekst}
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {resultaat && (
                        <Card className="border-2 border-green-500 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Soort potje bepaald!
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base font-semibold mb-2">Resultaat:</p>
                                <div
                                    className="text-base text-green-700 leading-relaxed mb-4"
                                    dangerouslySetInnerHTML={{ __html: resultaat }}
                                />
                                <Button onClick={handleReset} variant="default">
                                    Opnieuw Beginnen
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
