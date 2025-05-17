import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';

const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();

  const calculateProgress = () => {
    if (!campaign.goalAmount) return 0;
    return Math.min((campaign.amountRaised / campaign.goalAmount) * 100, 100);
  };

  const handleClick = () => {
    navigate(`/campaign/${campaign.publicKey}`);
  };

  const formatDeadline = () => {
    if (!campaign.deadline) return 'No deadline';

    const now = new Date();
    const deadline = new Date(campaign.deadline);

    if (deadline < now) {
      return 'Ended';
    }

    const diffTime = Math.abs(deadline - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 1 ? '1 day left' : `${diffDays} days left`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {campaign.imageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
            }}
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{campaign.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-3">
          {campaign.description}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>{campaign.amountRaised} SOL raised</span>
            <span className="font-medium">{calculateProgress().toFixed(0)}%</span>
          </div>

          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Goal: {campaign.goalAmount} SOL</span>
            <span>{formatDeadline()}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          onClick={handleClick}
          variant="outline"
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard; 