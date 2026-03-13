"use client";

import { FlaskConicalIcon, Loader2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { testDataSource } from "@/actions/testDataSource";
import { useState } from "react";

const TestDataSourceButton = ({ id }: { id: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await testDataSource(id);
    setIsLoading(false);
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

export default TestDataSourceButton;
