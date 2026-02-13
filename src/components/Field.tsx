import Stack from "@kiwicom/orbit-components/lib/Stack";
import Text from "@kiwicom/orbit-components/lib/Text";

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <Stack spacing="100">
    <Text size="small" type="secondary" weight="bold">
      {label}
    </Text>
    <Text>{children}</Text>
  </Stack>
);

export default Field;
