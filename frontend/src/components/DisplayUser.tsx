import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";

interface DisplayUserProps {
  fullName?: string;
  email?: string;
  phoneNumber?: string | null;
  title: string;
}

const DisplayUser = ({
  fullName,
  email,
  phoneNumber,
  title,
}: DisplayUserProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="border-b-2 pb-3">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-5">
          <User />
          <span>{fullName}</span>
        </CardContent>
        <CardContent className="flex gap-5">
          <Mail />
          <span>{email}</span>
        </CardContent>
        <CardContent className="flex gap-5">
          <Phone />
          <span>{phoneNumber}</span>
        </CardContent>
      </Card>
    </>
  );
};

export default DisplayUser;
