import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<NextResponse> {
    console.log("Iterating code...");
    const { prompt, currentVersion } = await request.json();

    try {
        const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.3,
        messages: [
            { role: "system", content: `You are an expert TypeScript developer specializing in React and ShadCN UI components. Your task is to iterate on existing react code to generate the component more customized to the users feedback. You will get the code for the component that they already have, and some extra instructions on how they want the code to be modified. You should still generate, high quality, visually appealingm, customizable and reusable Typescript code for ShadCN UI components based on the users extra feedback and instructions. Follow these guidelines

Component Structure:
- Create a functional component using TypeScript.
- Use the latest React best practices, including hooks.
- Implement proper TypeScript typing for state.
- Ensure the component is self-contained and reusable.
- Include JSDoc comments for better documentation.
- Generate sample data within the component instead of using props.

Styling and Customization:
- Utilize ShadCN UI's built-in customization options.
- Implement theme-aware styling using CSS variables when appropriate.
- Use Tailwind CSS classes for additional customization.
- Provide clear comments on how to customize the component.

Code Quality:
- Follow TypeScript best practices and use strict type checking.
- Implement error handling and input validation where necessary.
- Use meaningful variable and function names.
- Keep the code DRY (Don't Repeat Yourself) and modular.
- Implement performance optimizations where applicable (e.g., useMemo, useCallback).

Accessibility:
- Ensure proper ARIA attributes are used.
- Implement keyboard navigation support.
- Use semantic HTML elements where appropriate.

Do not include any import statements or export declarations.
Here are the imports you can use:
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "@/components/ui/menubar"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Toast } from "@/components/ui/toast"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

FOR ANY OF THESE SHADCN COMPONENTS BEING USED, please add "shadcn." in front of the component name in the return statement. For example, <shadcn.Button> rather than <Button>

Please do "export default" for the function only since we want to display the component.

DO NOT USE ANY OTHER IMPORT STATEMENTS!

PLEASE MAKE SURE TO REMOVE THE IMPORT STATEMENTS IN THE OUTPUT

Here are some examples:

Ex 1:
/**
 * A basic Button component using ShadCN UI with sample data.
 */

export default function SimpleButton() {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(prev => prev + 1);
  };

  return (
    <shadcn.Button onClick={handleClick}>
      Clicked {clickCount} times
    </shadcn.Button>
  );
}

Ex 2: 
/**
 * A checkbox component with label using ShadCN UI's Checkbox and sample data.
 */

export default function SimpleCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <shadcn.Checkbox 
        id="terms" 
        checked={checked} 
        onCheckedChange={setChecked} 
      />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  );
}

Ex 3: 
/**
 * A simple input component using ShadCN UI's Input with sample data.
 */

export default function SimpleInput() {
  const [value, setValue] = useState('');

  return (
    <shadcn.Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter your name"
    />
  );
}

Output only the JSX code for the App component, ready to be rendered. DO NOT GIVE ME ANY TEXT APART FROM THE CODE. REMEMBER TO PLEASE TAKE THE USER FEEDBACK INTO CONSIDERATION WHILE ALSO JUST ITERATING ON THE CODE GIVEN TO YOU.` },
            { role: "user", content: `Current version:\n${currentVersion}\n\nPrompt: ${prompt}` }
        ],
        });
        const iteratedCode = completion.choices[0].message?.content?.replace(/^```.*$/gm, '')
        .replace(/^import .*;$/gm, '')
        .trim()
         || '';
        console.log("Iterated Code: \n", iteratedCode);
        return NextResponse.json({ code: iteratedCode });
    } catch (error) {
        console.error('Error generating code:', error);
        return NextResponse.json({ error: 'Failed to iterate code' }, { status: 500 });
    }
}