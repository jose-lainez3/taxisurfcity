#!/usr/bin/env python3
"""Prueba pública del asistente desplegado. No utiliza ni imprime secretos."""
import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ENDPOINT="https://taxisurfcity.vercel.app/api/assistant"
ORIGIN="https://taxistuncoelsalvador.com"

def query(payload=None):
    body=json.dumps(payload).encode("utf-8") if payload is not None else None
    req=Request(ENDPOINT, data=body, headers={
      "Origin":ORIGIN,
      "Content-Type":"application/json",
      "Accept-Language":"es-SV",
      "User-Agent":"TaxiSurfCitySmokeTest/1.0 (https://taxistuncoelsalvador.com)"
    }, method="POST" if body else "GET")
    try:
        with urlopen(req,timeout=42) as r:
            return r.status,json.load(r)
    except HTTPError as e:
        return e.code,json.loads(e.read().decode("utf-8"))

def test_catalog():
    status,p=query({"message":"¿Dónde puedo ver el catálogo de tours con fotografías?"})
    assert status==200,("catalog HTTP",status,p.get("code"))
    assert "taxistuncoelsalvador.com/tours" in p.get("answer","")
    assert any("wa.me" in link.get("url","") for link in p.get("links",[]))
    print("OK catalog",status,"official-source",p.get("knowledgeSource"))

def test_recommendation():
    status,p=query({"message":"Recomiéndame sitios turísticos para visitar cerca de Playa El Tunco"})
    print("Recommendations HTTP:",status,"mode:",p.get("researchMode","none"),
          "sources:",len(p.get("sources",[])),
          "WhatsApp:",any("wa.me" in l.get("url","") for l in p.get("links",[])),
          "AI synthesis:",p.get("aiGenerated"))
    if status!=200:
        print("Warning: provider currently unavailable:",p.get("code",status))
        return False
    assert any("wa.me" in l.get("url","") for l in p.get("links",[]))
    if p.get("researchMode")=="none":
        print("Warning: Wikimedia did not return sources. General search requires TAVILY_API_KEY.")
        return False
    return True

if __name__=="__main__":
    status,p=query()
    assert status==200 and p.get("ready") is True,("health",status)
    print("OK health",status,"webSearch",p.get("webSearch"),
          "publicResearch",p.get("publicResearch"),"searchMode",p.get("searchMode"))
    test_catalog()
    good=test_recommendation()
    if not good:
        print("LIVE RESEARCH UNVERIFIED: check Wikimedia availability or configure Tavily.")
        sys.exit(2)
    print("SMOKE TEST PASSED")
