# Backend de Visão Computacional - PersonTrack AI

Este serviço Python/FastAPI executa o pipeline avançado de visão computacional:
1. **Decodificação e Streaming**: Preservação de FPS, resolução nativa (incluindo 4K 2160×3840) e áudio original.
2. **Detector de Pessoas**: YOLOv11/v8-seg filtrando estritamente `class 0` (person), ignorando veículos, postes e falsos positivos.
3. **Inferência em Alta Resolução & Tiled (SAHI)**: Fatiamento em blocos com 25% de sobreposição para não perder pessoas distantes e pequenas no fundo.
4. **Segmentação Refinada SAM 2**: Meta Segment Anything 2 em modo vídeo com memória temporal.
5. **Rastreamento com ReID**: BoT-SORT / TrackTrack / Deep OC-SORT com extração de embeddings OSNet.
6. **Gerenciamento de Estado LOST**: Tracks temporariamente ocluídos não trocam de ID imediatamente e são recuperados ao reaparecer.
7. **2º Passe Offline de Reconciliação Global**: Fusão de tracklets para corrigir ID switches residuais.
8. **Codificação FFmpeg**: Saída MP4 H.264 preservando a trilha de áudio original (`-c:a copy`).

---

## Como Rodar Localmente (com GPU ou CPU)

```bash
# 1. Instalar dependências
pip install -r requirements.txt
pip install git+https://github.com/facebookresearch/segment-anything-2.git

# 2. Iniciar servidor FastAPI na porta 8000
uvicorn cv_service:app --host 0.0.0.0 --port 8000
```

## Como Conectar ao PersonTrack AI

Defina a variável no AI Studio ou no arquivo `.env`:

```env
PROCESSING_API_URL="http://localhost:8000"
# ou no Cloud Run:
# PROCESSING_API_URL="https://persontrack-cv-xyz.run.app"
```
