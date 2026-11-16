import { Button } from "@navikt/ds-react";
import { sendPdfOgOppdaterForelopigSvar } from "../../../redux/actions";
import { useAppDispatch } from "../../../store";
import { lagDummyPdfFormData } from "../../../utils/dummyPdf";

const ForelopigSvarButton = () => {
  const dispatch = useAppDispatch();

  return (
    <Button
      size="small"
      onClick={() => {
        dispatch(sendPdfOgOppdaterForelopigSvar(lagDummyPdfFormData("Forelopig svar")));
      }}
    >
      {"Send foreløpig svar"}
    </Button>
  );
};

export default ForelopigSvarButton;
