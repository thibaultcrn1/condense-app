"use client";

import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";

export function AccountMenu({ name, email }: { name: string; email: string }) {
  const { t, href } = useI18n();
  const router = useRouter();
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full" aria-label={t.account.menu} />
        }
      >
        <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-sm font-semibold">
          {initial}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="truncate font-medium">{name}</p>
            <p className="text-muted-foreground truncate text-xs font-normal">{email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(href("/dashboard/settings"))}>
          <Settings /> {t.account.settings}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut();
            router.push(href("/sign-in"));
            router.refresh();
          }}
        >
          <LogOut /> {t.account.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
