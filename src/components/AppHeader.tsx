import { useAuthContext } from '@asgardeo/auth-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCustomContext } from '../context/CustomContext';

import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PanelLeftClose from '@mui/icons-material/Menu';
import MenuIcon from '@mui/icons-material/Menu';

const I18N_KEY = 'components.header';

interface AppHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function AppHeader({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, signOut } = useAuthContext();
  const { gebruiker, actieveAdministratie } = useCustomContext();

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('User signed out');
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  };

  // Get initials from email for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-background shrink-0 border-b">
      <div className="flex h-14 items-center px-4 gap-2">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <MenuIcon className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex items-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <PanelLeftClose
            className={cn(
              'h-5 w-5 text-muted-foreground transition-all',
              isCollapsed && 'rotate-180',
            )}
          />
        </Button>

        <Separator orientation="vertical" className="h-4" />

        {/* Active Administration Name (shown when authenticated) */}
        {state.isAuthenticated && actieveAdministratie && (
          <div
            className="hidden md:block cursor-pointer"
            onClick={() => navigate('/profiel')}
          >
            <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              {actieveAdministratie.naam}
            </p>
          </div>
        )}

        {/* Right side - User profile */}
        <div className="ml-auto flex items-center gap-4">
          {state.isAuthenticated && gebruiker && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {getInitials(gebruiker.bijnaam)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {gebruiker.bijnaam}
                    </p>
                    {actieveAdministratie && (
                      <p className="text-xs text-muted-foreground">
                        {actieveAdministratie.naam}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate('/gebruikersprofiel')}
                  >
                    <PersonOutlineOutlinedIcon className="mr-2 h-4 w-4" />
                    <span>{t(`${I18N_KEY}.profiel`)}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogoutIcon className="mr-2 h-4 w-4" />
                  <span>{t(`${I18N_KEY}.uitloggen`)}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
