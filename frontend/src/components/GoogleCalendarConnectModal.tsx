import { Calendar, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";

interface GoogleCalendarConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  currentEmail?: string;
}

export function GoogleCalendarConnectModal({
  isOpen,
  onClose,
  onConnect,
  currentEmail,
}: GoogleCalendarConnectModalProps) {
  const handleClose = () => {
    onClose();
  };

  const handleConnect = () => {
    onConnect();
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-md"
        onEscapeKeyDown={handleClose}
        onInteractOutside={(e) => {
          e.preventDefault();
          handleClose();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Connect Google Calendar
          </DialogTitle>
          <DialogDescription>
            Connect your Google Calendar to sync appointments and events
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Email Info */}
          {currentEmail && (
            <div className="p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Current Account
                </span>
              </div>
              <p className="text-sm text-blue-700">{currentEmail}</p>
            </div>
          )}

          {/* Important Notice */}
          <div className="p-3 bg-amber-50 rounded-lg border">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-amber-900">
                  Important: Email Selection
                </p>
                <p className="text-sm text-amber-700">
                  You will be prompted to select a Google account. Please ensure
                  the email you choose matches your account email in our system.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Steps */}
          <div className="space-y-3">
            <h4 className="font-medium">What happens next:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <span className="text-sm">You'll be redirected to Google</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <span className="text-sm">
                  Choose or switch to the correct Google account
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <span className="text-sm">
                  Grant calendar access permissions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">4</span>
                </div>
                <span className="text-sm">
                  You'll be redirected back to our system
                </span>
              </div>
            </div>
          </div>

          {/* Email Matching Warning */}
          <div className="p-3 bg-red-50 rounded-lg border">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Email Must Match
                </p>
                <p className="text-sm text-red-700">
                  The Google account email must match your account email in our
                  system for security reasons.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            className="flex-1"
            type="button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConnect} 
            className="flex-1"
            type="button"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Connect Calendar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
