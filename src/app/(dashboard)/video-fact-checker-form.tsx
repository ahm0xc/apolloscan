import { SearchIcon } from "lucide-react";

import { checkFact } from "~/actions/server-actions";
import { Button } from "~/components/ui/button";

export default function VideoFactCheckerForm() {
  return (
    <form
      action={checkFact}
      className="h-12 rounded-full flex items-center gap-2 border pr-1 w-[35vw] min-w-[350px] bg-accent"
    >
      <input
        type="url"
        name="url"
        placeholder="Paste a video link here"
        className="bg-transparent border-none outline-none flex-1 px-4 h-full rounded-full"
      />
      <Button size="icon" className="rounded-full bg-pink-600">
        <SearchIcon className="w-4 h-4" />
      </Button>
    </form>
  );
}
