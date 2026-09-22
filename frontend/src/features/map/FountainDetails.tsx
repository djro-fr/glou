import type { Fountain } from "./types/fountain";
import "./FountainDetails.scss";

import {sanitizeString} from '../../shared/helpers/string'
import IconSprite from "../../shared/components/IconSprite";

interface FountainDetailsProps {
  fountain: Fountain;
  onClose: () => void;
}

function colorStatus(s: string): string {
  if (s?.toLowerCase() === "ouverte") {
    return "op";
  } else if (s?.toLowerCase().startsWith("ferm")) {
    return "cl";
  } else {
    return "nc";
  }
}

function FountainDetails({
  fountain,
  onClose,
}: Readonly<FountainDetailsProps>) {
  return (
    <div className="fountain-panel">
      <div className="content">
        <div className="close-wrapper">
          <button onClick={onClose} aria-label="Fermer">
            <IconSprite />
            <svg width="20" height="20" aria-hidden="true">
              <use href="#CloseSVG" />
            </svg>
          </button>
        </div>             
      
        <h2>Fontaine n°{fountain.id}</h2>
        <div className="field">
          <p>Statut</p>
          <p>
            <i className={"status " + colorStatus(fountain.status_f)}></i>{" "}
            {fountain.status_f || "Non communiqué"}
          </p>
        </div>
        <div className="field">
          <p>Commune</p>
          <p>{fountain.city.toUpperCase()}</p>
        </div>
        <div className="field">
          <p>Quartier</p>
          <p>{sanitizeString(fountain.name_d)}</p>
        </div>
        <div className="field">
          <p>Localisation</p>
          <p>{sanitizeString(fountain.location_f)}</p>
        </div>
        <div className="field">
          <p>Adresse</p>
          <p>{sanitizeString(fountain.address_f)}</p>
        </div>
        <div className="field">
          <p>Type</p>
          <p>{fountain.type_f}</p>
        </div>
      </div>
    </div>
  );
}

export default FountainDetails;
