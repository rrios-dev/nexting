import { useActionState, useState } from "react";
import testServerAction from "../actions/test-server-action";

const Test = () => {
  const [state, setState] = useState<any>();

  const handleClick = async () => {
    const result = await testServerAction({ name: "John" });

    if (result.type === "success") {
      setState(result.data);
    } else {
      setState(result.error);
    }
  };

  return <button onClick={handleClick}>Test</button>;
};

export default Test;
