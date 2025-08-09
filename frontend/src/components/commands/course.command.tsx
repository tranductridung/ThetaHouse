import { useEffect, useRef, useState } from "react";
import api from "@/api/api";
import type { CourseType } from "../schemas/course.schema";
import { toast } from "sonner";

export function CourseList({
  onSelect,
}: {
  onSelect: (course: CourseType) => void;
}) {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const pageSize = 10;

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCourses();
  }, [page]);

  const fetchCourses = async () => {
    if (isFetching.current || !hasMore) return;
    isFetching.current = true;
    try {
      const res = await api.get(`/courses?page=${page}&limit=${pageSize}`);
      const items: CourseType[] = res.data.courses || [];

      setCourses((prev) => [...prev, ...items]);
      setHasMore(items.length === pageSize);
    } catch (err) {
      toast.error("Failed to fetch courses");
    } finally {
      isFetching.current = false;
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20 && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="h-[500px] overflow-y-auto border rounded p-2 space-y-2"
    >
      {courses.map((course) => (
        <div
          key={course.id}
          className="p-2 border rounded cursor-pointer hover:bg-muted"
          onClick={() => onSelect(course)}
        >
          <div className="font-medium">{course.name}</div>
          <div className="text-sm text-muted-foreground">
            {course.description}
          </div>
        </div>
      ))}

      {!hasMore && (
        <div className="text-center text-muted-foreground text-sm py-2">
          No more courses
        </div>
      )}
    </div>
  );
}
