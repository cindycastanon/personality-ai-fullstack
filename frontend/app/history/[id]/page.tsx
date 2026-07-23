"use client";
import { apiFetch } from "@/lib/api";
import ResultReport, { Report } from "@/components/ResultReport";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
export default function SavedReportPage(){const params=useParams();const [report,setReport]=useState<Report|null>(null);const [error,setError]=useState("");useEffect(()=>{apiFetch<{prediction:Report}>(`/predictions/${params.id}`).then(d=>setReport(d.prediction)).catch(e=>setError(e instanceof Error?e.message:"Could not load report."));},[params.id]);return <section>{error&&<p className="error">{error}</p>}{report?<ResultReport report={report}/>:!error&&<p>Loading report…</p>}</section>}
