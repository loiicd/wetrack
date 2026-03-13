"use client";

import { FlaskConicalIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { testQuery } from "@/actions/testQuery";
import { Button } from "./ui/button";

const TestQueryButton = ({ id }: { id: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      await testQuery(id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleClick}>
      {isLoading ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <FlaskConicalIcon />
      )}
    </Button>
  );
};

export default TestQueryButton;
