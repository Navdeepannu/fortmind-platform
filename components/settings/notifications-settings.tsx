"use client";

import { useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { notificationTypes, type EmailFrequency } from "@/lib/settings-data";
import { SettingRow, SettingsForm, SettingsGroup, useSettingsForm } from "./settings-form";

const permissionListeners = new Set<() => void>();
function subscribePermission(listener: () => void) {
  permissionListeners.add(listener);
  window.addEventListener("focus", listener);
  return () => { permissionListeners.delete(listener); window.removeEventListener("focus", listener); };
}
const permissionSnapshot = () => typeof Notification === "undefined" || !window.isSecureContext ? "unavailable" : Notification.permission;
const serverPermission = () => "checking" as const;
const emailOptions = [{ value: "off", label: "Off" }, { value: "immediate", label: "Right Away" }, { value: "daily", label: "Daily Summary" }];
export function NotificationsSettings() {
  const form = useSettingsForm("notifications");
  const permission = useSyncExternalStore(subscribePermission, permissionSnapshot, serverPermission);
  const [permissionError, setPermissionError] = useState("");
  const { theme, setTheme } = useTheme();
  async function requestPermission() {
    try { await Notification.requestPermission(); permissionListeners.forEach(listener => listener()); }
    catch { setPermissionError("The browser could not request permission. Check your browser’s site settings."); }
  }
  return <SettingsForm title="Notifications" description="Choose which events appear for you and how you would like to receive them. These preferences are personal, not organization-wide escalation policy." personal state={form}>
    <SettingsGroup title="Notification preferences" description="Email is off by default. Push delivery is not connected. Weekly reports are email-only.">
      <Table><TableHeader><TableRow><TableHead className="min-w-52 pl-5">Notification</TableHead><TableHead>In app</TableHead><TableHead>Email delivery</TableHead><TableHead className="pr-5">Push</TableHead></TableRow></TableHeader><TableBody>
        {notificationTypes.map(type => {
          const pref = form.value.preferences[type.id];
          const options = type.id === "weekly" ? [{ value: "off", label: "Off" }, { value: "immediate", label: "Weekly Report" }] : emailOptions;
          return <TableRow key={type.id}><TableCell className="py-4 pl-5"><p className="font-medium">{type.name}</p><p className="mt-1 max-w-64 whitespace-normal text-caption text-muted-foreground">{type.description}</p></TableCell>
            <TableCell>{type.id === "weekly" ? <span className="text-caption text-muted-foreground">Email only</span> : <Switch aria-label={`${type.name} in-app notifications`} checked={pref.inApp} onCheckedChange={inApp => form.change({ preferences: { ...form.value.preferences, [type.id]: { ...pref, inApp } } })} />}</TableCell>
            <TableCell><Select value={pref.email} items={options} onValueChange={email => { if (email) form.change({ preferences: { ...form.value.preferences, [type.id]: { ...pref, email: email as EmailFrequency } } }); }}><SelectTrigger aria-label={`${type.name} email delivery`} className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{options.map(option => <SelectItem value={option.value} key={option.value}>{option.label}</SelectItem>)}</SelectGroup></SelectContent></Select></TableCell>
            <TableCell className="pr-5">{type.id !== "weekly" && <Switch aria-label={`${type.name} push unavailable`} checked={false} disabled />}</TableCell>
          </TableRow>;
        })}
      </TableBody></Table>
    </SettingsGroup>
    <SettingsGroup title="Delivery channels">
      <SettingRow label="Browser permission" description={permission === "granted" ? "Permission granted in this browser. Push delivery still requires a connected notification service." : permission === "denied" ? "Blocked by this browser. Change the site permission in browser settings to allow notifications." : permission === "unavailable" ? "Notifications are unavailable in this browser or browsing context." : "Permission is requested only when you choose to enable it."}>
        <Button type="button" variant="outline" disabled={permission !== "default"} onClick={requestPermission}>{permission === "granted" ? "Permission granted" : permission === "denied" ? "Blocked in browser" : permission === "unavailable" ? "Unavailable" : "Enable in this browser"}</Button>
      </SettingRow>
      {permissionError && <p role="alert" className="px-5 py-3 text-caption text-destructive">{permissionError}</p>}
      <div className="px-5 py-4 text-caption text-muted-foreground">The source product limits immediate email to six messages per hour. Its daily summary sends one email per day from 08:00 UTC when there is content. This prototype saves your choices but does not schedule email or push notifications. A verified delivery address and backend delivery service are still required.</div>
    </SettingsGroup>
    <SettingsGroup title="Appearance" description="Applies immediately on this device, independently of the Save changes button."><SettingRow label="Color theme" htmlFor="personal-theme" description="Use your system setting or choose a theme."><NativeSelect id="personal-theme" value={theme ?? "system"} onChange={event => setTheme(event.target.value)}><NativeSelectOption value="system">System</NativeSelectOption><NativeSelectOption value="light">Light</NativeSelectOption><NativeSelectOption value="dark">Dark</NativeSelectOption></NativeSelect></SettingRow></SettingsGroup>
  </SettingsForm>;
}
