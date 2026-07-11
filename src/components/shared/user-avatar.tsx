import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials, avatarColor } from '@/lib/utils';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  className?: string;
}

export function UserAvatar({ name, imageUrl, className }: UserAvatarProps) {
  const color = avatarColor(name);
  return (
    <Avatar className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback
        style={{ backgroundColor: color, color: '#fff', fontWeight: 600, fontSize: '14px' }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
