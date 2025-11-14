import { useState } from "react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Shield,
  Zap,
  Lock,
  CheckCircle2,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

const Index = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      icon: Lock,
      title: "Fully Encrypted Picks",
      description: "Your predictions are encrypted using Zama FHE technology, ensuring complete privacy until results are revealed.",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Provably Fair",
      description: "On-chain randomness and transparent settlement ensure no one can manipulate the outcomes.",
      color: "text-green-500"
    },
    {
      icon: Zap,
      title: "Instant Settlement",
      description: "Automated settlement and prize distribution powered by smart contracts.",
      color: "text-yellow-500"
    },
    {
      icon: TrendingUp,
      title: "Dynamic Scoring",
      description: "Earn points based on your prediction accuracy and confidence weights.",
      color: "text-purple-500"
    }
  ];

  const stats = [
    { label: "Total Prize Pool", value: "50+ ETH" },
    { label: "Active Series", value: "12" },
    { label: "Participants", value: "500+" },
    { label: "Success Rate", value: "99.9%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                AuroraPickem
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/series">
                <Button variant="ghost" size="sm">Browse Series</Button>
              </Link>
              <Link to="/my-tickets">
                <Button variant="ghost" size="sm">My Tickets</Button>
              </Link>
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by Zama FHE
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Privacy-Preserving
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pick'em Games
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Predict sports outcomes with encrypted picks. Your predictions stay private until results are revealed,
              ensuring fair competition for everyone.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/series">
                <Button size="lg" className="gap-2">
                  Start Playing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                <PlayCircle className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Demo Video Card */}
          <Card className="overflow-hidden border-2 border-primary/20 shadow-xl">
            <CardContent className="p-0">
              {isVideoPlaying ? (
                <div className="aspect-video bg-black">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full"
                  >
                    <source src="/vedio.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div
                  className="aspect-video bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10 relative cursor-pointer group"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform" />
                        <PlayCircle className="h-20 w-20 text-primary relative z-10 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-sm font-medium">Click to play demo</p>
                    </div>
                  </div>
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose AuroraPickem?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the next generation of pick'em games with privacy-preserving technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader>
                <feature.icon className={`h-10 w-10 mb-2 ${feature.color}`} />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple steps to start playing and winning
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Choose a Series",
              description: "Browse active prediction series and select one that interests you"
            },
            {
              step: "02",
              title: "Make Encrypted Picks",
              description: "Submit your predictions with confidence weights - all fully encrypted on-chain"
            },
            {
              step: "03",
              title: "Win & Claim Prizes",
              description: "After settlement, top scorers can claim their share of the prize pool"
            }
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5">
          <CardContent className="py-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Playing?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join hundreds of players making encrypted predictions and winning prizes
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/series">
                <Button size="lg" className="gap-2">
                  Browse Series
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/my-tickets">
                <Button size="lg" variant="outline">
                  View My Tickets
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>Built with Zama FHE • Secured by Blockchain • Privacy First</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
