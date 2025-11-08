import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg aurora-gradient flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-xl font-bold">Aurora Pick'em</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/my-tickets">
              <Button
                variant={location.pathname === "/my-tickets" ? "default" : "ghost"}
                className={cn(
                  location.pathname === "/my-tickets" && "aurora-gradient"
                )}
              >
                <Ticket className="mr-2 h-4 w-4" />
                My Tickets
              </Button>
            </Link>

            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
