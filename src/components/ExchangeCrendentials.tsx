import { ExchangeType, exchangeConfigs } from "@/data/exchangeConfigs";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { useToast } from "./ui/use-toast";
import { LockIcon, InfoIcon } from "lucide-react";

type ExchangeCrendentialsProps = {
  activeExchange: ExchangeType;
  onClose: () => void;
};

export const ExchangeCrendentials: React.FC<ExchangeCrendentialsProps> = ({
  activeExchange,
  onClose,
}) => {
  const neededCredentials = exchangeConfigs[activeExchange]?.neededCredentials;
  const { toast } = useToast();

  const formSchema = z.object(
    neededCredentials.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.id]: z.string().min(0),
      };
    }, {})
  );

  const getCookieKey = (id: string) => {
    return `${activeExchange}_${id}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: neededCredentials.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.id]: Cookies.get(getCookieKey(cur.id)) || "",
      };
    }, {}),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    for (const key in values) {
      Cookies.set(getCookieKey(key), String((values as any)[key]));
    }
    toast({
      title: `${activeExchange} credentials set successfully`,
      variant: "default",
    });
    onClose();
  }

  return (
    <div className="text-sm text-muted-foreground pt-4">
      {neededCredentials.length ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {neededCredentials.map((credential) => {
              return (
                <FormField
                  key={credential.id}
                  control={form.control}
                  // @ts-ignore
                  name={credential.id}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel className="w-[120px] text-sm">
                          {credential.name}
                        </FormLabel>
                        <FormControl className="w-full text-sm">
                          <Input {...field} autoComplete="off" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
            <Alert className="bg-blue-800">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Note:</AlertTitle>
              <AlertDescription>
                After you enter your credentials, page will be refreshed. You
                can test if the api key is successfully setup or not by placing
                a small order.
              </AlertDescription>
            </Alert>
            <Alert className="bg-green-800">
              <LockIcon className="h-4 w-4" />
              <AlertTitle>Your credentials are only visible to you</AlertTitle>
              <AlertDescription>
                Stored safely and not shared with anyone.
              </AlertDescription>
            </Alert>
            <Button size="sm" variant="secondary" type="submit">
              Setup
            </Button>
          </form>
        </Form>
      ) : (
        <Alert className="bg-blue-800">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Authentication is not supported</AlertTitle>
          <AlertDescription>
            Either {activeExchange} does not support or UnifiedX did not
            implement authentication yet.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
