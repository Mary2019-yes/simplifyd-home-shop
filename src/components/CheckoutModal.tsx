import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  companyName: z.string().trim().max(100).optional(),
  address: z.string().trim().min(1, "Street address is required").max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "Town/City is required").max(100),
  county: z.string().trim().min(1, "State/County is required").max(100),
  zip: z.string().trim().max(20).optional(),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  email: z.string().trim().email("Invalid email address").max(255),
  notes: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(["mpesa", "cod"], {
    required_error: "Please select a payment method",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CheckoutModal = ({ open, onOpenChange }: CheckoutModalProps) => {
  const { cart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      address: "",
      addressLine2: "",
      city: "",
      county: "",
      zip: "",
      phone: "",
      email: "",
      notes: "",
      paymentMethod: "mpesa",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      if (data.paymentMethod === "mpesa") {
        // Initiate M-Pesa payment
        const { data: paymentData, error } = await supabase.functions.invoke('mpesa-payment', {
          body: {
            phoneNumber: data.phone,
            amount: getTotalPrice(),
          },
        });

        if (error) throw error;

        if (paymentData?.success) {
          toast.success(paymentData.message);
          // Clear cart and close modal after successful payment initiation
          clearCart();
          onOpenChange(false);
          form.reset();
        } else {
          throw new Error(paymentData?.error || 'Payment failed');
        }
      } else {
        // Cash on Delivery - send to WhatsApp
        const orderItems = cart
          .map(
            (item) =>
              `${item.name} (x${item.quantity}) - KSh ${(item.price * item.quantity).toLocaleString()}`
          )
          .join("%0A");

        const orderSummary = `
*New Order from ${data.firstName} ${data.lastName}*%0A%0A
*Contact Information:*%0A
Phone: ${data.phone}%0A
Email: ${data.email}%0A%0A
*Shipping Address:*%0A
${data.address}${data.addressLine2 ? "%0A" + data.addressLine2 : ""}%0A
${data.city}, ${data.county}${data.zip ? ", " + data.zip : ""}%0A
Kenya%0A${data.companyName ? "%0ACompany: " + data.companyName : ""}%0A%0A
*Order Items (${getTotalItems()} items):*%0A
${orderItems}%0A%0A
*Total: KSh ${getTotalPrice().toLocaleString()}*%0A%0A
*Payment Method: Cash on Delivery*%0A
${data.notes ? "%0A*Order Notes:*%0A" + data.notes : ""}
        `.trim();

        const whatsappUrl = `https://wa.me/254743039253?text=${orderSummary}`;
        window.open(whatsappUrl, "_blank");

        clearCart();
        onOpenChange(false);
        form.reset();
        toast.success("Order placed! We'll contact you shortly.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Checkout</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Country / Region *</FormLabel>
              <Input value="Kenya" readOnly className="bg-muted" />
            </FormItem>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="House number and street name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressLine2"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="Apartment, suite, unit, etc. (optional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town / City *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="county"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / County *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Nairobi County" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode / ZIP</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Notes about your order, e.g. special instructions"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-3 space-y-0 border rounded-md p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="mpesa" id="mpesa" />
                        <Label htmlFor="mpesa" className="font-normal cursor-pointer flex-1">
                          <div className="font-semibold">M-Pesa Payment</div>
                          <div className="text-sm text-muted-foreground">Pay with M-Pesa mobile money</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 space-y-0 border rounded-md p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="font-normal cursor-pointer flex-1">
                          <div className="font-semibold">Cash on Delivery</div>
                          <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold mb-4">Your Order</h3>
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">KSh {getTotalPrice().toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
